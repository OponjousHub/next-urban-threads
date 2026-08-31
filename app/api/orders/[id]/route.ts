import { NextResponse } from "next/server";
import { OrderStatus, PaymentStatus, TrackingEventType } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

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
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json(
      { error: "Default tenant not found" },
      { status: 404 },
    );
  }

  try {
    const body: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
    } = await req.json();

    const { status, paymentStatus } = body;

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "No status or paymentStatus provided" },
        { status: 400 },
      );
    }

    const existingOrder = await prisma.order.findFirst({
      where: {
        id: params.id,
        tenantId: tenant.id,
      },
      select: {
        id: true,
        status: true,
        paymentStatus: true,
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
      const effectivePaymentStatus =
        paymentStatus ?? existingOrder.paymentStatus;

      /*
       * DELIVERED
       *
       * Only a paid order can be delivered.
       * It must also already be PROCESSING or SHIPPED.
       */
      if (status === OrderStatus.DELIVERED) {
        if (effectivePaymentStatus !== PaymentStatus.PAID) {
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
          existingOrder.status !== OrderStatus.SHIPPED
        ) {
          return NextResponse.json(
            {
              error:
                "Only processing or shipped orders can be marked as delivered",
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
        if (
          existingOrder.status === OrderStatus.SHIPPED ||
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

    /*
     * ---------------------------------------------------------
     * UPDATE ORDER + CREATE TRACKING EVENT
     * ---------------------------------------------------------
     */

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const updateData: {
        status?: OrderStatus;
        paymentStatus?: PaymentStatus;
      } = {};

      if (status) {
        updateData.status = status;
      }

      if (paymentStatus) {
        updateData.paymentStatus = paymentStatus;
      }

      const updated = await tx.order.update({
        where: {
          id: existingOrder.id,
        },
        data: updateData,
      });

      /*
       * Only create a tracking event when the order status
       * actually changed.
       */
      if (status && status !== existingOrder.status) {
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
      }

      return updated;
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("ORDER STATUS UPDATE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
