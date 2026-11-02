import { NextResponse } from "next/server";
import {
  OrderStatus,
  PaymentStatus,
  TrackingEventType,
  RefundStatus,
} from "@prisma/client";
import { prisma } from "@/utils/prisma";
import { requireAdminOrOwner } from "@/lib/server/auth";

function getTrackingDetails(status: OrderStatus) {
  switch (status) {
    case OrderStatus.PENDING:
      return {
        title: "Order placed",
        description: "Your order has been received",
      };

    case OrderStatus.PROCESSING:
      return {
        title: "Order is being processed",
        description: "We are preparing your order",
      };

    case OrderStatus.SHIPPED:
      return {
        title: "Order shipped",
        description: "Your package is on the way",
      };

    case OrderStatus.OUT_FOR_DELIVERY:
      return {
        title: "Out for delivery",
        description: "Your package is out for delivery and will arrive today",
      };

    case OrderStatus.DELIVERED:
      return {
        title: "Order delivered",
        description: "Your order has been delivered",
      };

    case OrderStatus.CANCELLED:
      return {
        title: "Order cancelled",
        description: "This order has been cancelled",
      };

    default:
      return {
        title: "Order updated",
        description: `Order status changed to ${status}`,
      };
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const param = await params;

  let tenant;

  try {
    ({ tenant } = await requireAdminOrOwner());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unauthorized";

    return NextResponse.json(
      { error: message },
      { status: message === "Forbidden" ? 403 : 401 },
    );
  }

  try {
    const body = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    // Payment status must only be changed by verified payment processes.
    if (Object.prototype.hasOwnProperty.call(body, "paymentStatus")) {
      return NextResponse.json(
        {
          error:
            "Manual payment status updates are not permitted. Payment must be verified by the payment provider.",
        },
        { status: 403 },
      );
    }

    const status = body.status as OrderStatus | undefined;

    if (!status) {
      return NextResponse.json(
        { error: "Order status is required" },
        { status: 400 },
      );
    }

    if (!Object.values(OrderStatus).includes(status)) {
      return NextResponse.json(
        { error: "Invalid order status" },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: param.id,
        tenantId: tenant.id,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
        refundStatus: true,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    /*
     * ---------------------------------------------------------
     * VALIDATE STATUS TRANSITIONS
     * ---------------------------------------------------------
     */

    if (status && status !== existingOrder.status) {
      /*
       * DELIVERED
       *
       * Only a paid order can be delivered.
       * It must also already be PROCESSING or SHIPPED.
       */
      if (status === OrderStatus.DELIVERED) {
        if (existingOrder.paymentStatus !== "PAID") {
          return NextResponse.json(
            {
              error:
                "Only orders with successful payment can be marked as delivered",
            },
            { status: 400 },
          );
        }

        if (
          existingOrder.status !== OrderStatus.PROCESSING &&
          existingOrder.status !== OrderStatus.SHIPPED &&
          existingOrder.status !== OrderStatus.OUT_FOR_DELIVERY
        ) {
          return NextResponse.json(
            {
              error:
                "Only processing, shipped, or out-for-delivery orders can be marked as delivered",
            },
            { status: 400 },
          );
        }
      }

      /*
       * CANCELLED
       *
       * An order should not be cancelled after shipment or delivery.
       */
      if (status === OrderStatus.CANCELLED) {
        // Paid orders can only be cancelled after the refund succeeds.
        if (
          existingOrder.paymentStatus === PaymentStatus.PAID &&
          existingOrder.refundStatus !== RefundStatus.REFUNDED
        ) {
          return NextResponse.json(
            {
              error:
                "This paid order cannot be cancelled until its refund has been successfully completed.",
            },
            { status: 400 },
          );
        }

        if (
          existingOrder.status === OrderStatus.SHIPPED ||
          existingOrder.status === OrderStatus.OUT_FOR_DELIVERY ||
          existingOrder.status === OrderStatus.DELIVERED
        ) {
          return NextResponse.json(
            {
              error: "Shipped or delivered orders cannot be cancelled",
            },
            { status: 400 },
          );
        }

        if (existingOrder.status === OrderStatus.CANCELLED) {
          return NextResponse.json(
            {
              error: "This order is already cancelled",
            },
            { status: 400 },
          );
        }
      }

      /*
       * Prevent changing the status of a delivered order.
       */
      if (existingOrder.status === OrderStatus.DELIVERED) {
        return NextResponse.json(
          {
            error: "Delivered orders cannot have their status changed",
          },
          { status: 400 },
        );
      }

      /*
       * Prevent changing the status of a cancelled order.
       */
      if (existingOrder.status === OrderStatus.CANCELLED) {
        return NextResponse.json(
          {
            error: "Cancelled orders cannot have their status changed",
          },
          { status: 400 },
        );
      }
    }

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updateData: {
        status: OrderStatus;
      } = {
        status,
      };

      // ---------------------------------------------------------
      // IMPORTANT:
      // Atomically update the order only if its status is still
      // the status we originally read.
      //
      // This prevents multiple concurrent PATCH requests from
      // creating multiple tracking events for the same transition.
      // ---------------------------------------------------------

      let updated;

      if (status && status !== existingOrder.status) {
        const statusUpdate = await tx.order.updateMany({
          where: {
            id: existingOrder.id,
            tenantId: tenant.id,
            status: existingOrder.status,
            paymentStatus: existingOrder.paymentStatus,
            refundStatus: existingOrder.refundStatus,
          },
          data: updateData,
        });

        // Another request changed the order, payment, or refund state.
        if (statusUpdate.count === 0) {
          return null;
        }

        // This request successfully performed the status transition.
        updated = await tx.order.findUnique({
          where: {
            id: existingOrder.id,
          },
        });

        if (!updated) {
          throw new Error("Updated order could not be found");
        }

        const trackingDetails = getTrackingDetails(status);

        await tx.orderTrackingEvent.create({
          data: {
            orderId: existingOrder.id,
            tenantId: tenant.id,
            type: TrackingEventType.STATUS_CHANGE,
            status,
            title: trackingDetails.title,
            description: trackingDetails.description,
          },
        });
      } else {
        // Payment-only update, or no actual status transition.
        updated = await tx.order.update({
          where: {
            id: existingOrder.id,
          },
          data: updateData,
        });
      }

      return updated;
    });

    if (!updatedOrder) {
      return NextResponse.json(
        {
          error:
            "This order changed while you were updating it. Refresh the order and try again.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("ORDER STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
