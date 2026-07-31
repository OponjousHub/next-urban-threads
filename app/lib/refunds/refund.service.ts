import { Prisma } from "@prisma/client";
import { prisma } from "@/utils/prisma";

import { refundPayment } from "../payments/refundPayment";
import InventoryService from "@/lib/inventory/inventory.service";

import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export type RefundRequestInput = {
  orderId: string;

  reason: string;

  description?: string;

  items: {
    productId: string;
    variantId?: string | null;

    quantity: number;

    priceAtPurchase: number;
  }[];
};

function calculateRefundAmount(items: RefundRequestInput["items"]) {
  return items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0,
  );
}

export async function submitRefundRequest(data: RefundRequestInput) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  // Fetch order
  const order = await prisma.order.findFirst({
    where: {
      id: data.orderId,
      tenantId: tenant.id,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  // Only delivered orders can be refunded
  if (order.status !== "DELIVERED") {
    throw new Error("Refunds can only be requested after delivery.");
  }

  // Prevent duplicate requests
  const existing = await prisma.refundRequest.findFirst({
    where: {
      orderId: order.id,
      tenantId: tenant.id,
      status: {
        in: ["REQUESTED", "PROCESSING"],
      },
    },
  });

  if (existing) {
    throw new Error("A refund request already exists for this order.");
  }

  const requestedAmount = calculateRefundAmount(data.items);

  console.log(
    "VARIANT INFOR",
    data.items.map((item) => ({
      productId: item.productId,
      variantId: item.variantId,
    })),
  );

  const variant = await prisma.productVariant.findUnique({
    where: {
      id: data.items[0].variantId!,
    },
  });

  console.log("PRINT VARIANT", variant);

  // Create refund request + items
  const refund = await prisma.refundRequest.create({
    data: {
      tenantId: tenant.id,

      order: {
        connect: {
          id: order.id,
        },
      },
      user: {
        connect: {
          id: order.userId,
        },
      },
      vendorId: order.vendorId,

      status: "REQUESTED",

      reason: data.reason,
      description: data.description,

      requestedAmount,
      currency: order.currency!,
      storeMode: order.storeMode,

      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId ?? null,
          quantity: item.quantity,
          priceAtPurchase: Number(item.priceAtPurchase),
        })),
      },
    },

    include: {
      items: true,
    },
  });

  // Timeline
  await prisma.orderTrackingEvent.create({
    data: {
      tenantId: tenant.id,

      orderId: order.id,

      status: order.status,

      type: "REFUND",

      title: "Refund Requested",

      description:
        "Your refund request has been submitted and is awaiting review.",
    },
  });

  // Vendor notification
  if (order.vendorId) {
    await NotificationService.notify({
      vendorId: order.vendorId,

      setting: "refundRequested",

      type: "REFUND",

      title: "Refund Requested",

      message: `${order.user.name ?? "A customer"} requested a refund for Order #${order.id.slice(-8)}.`,

      link: `/vendor/refunds/${refund.id}`,

      metadata: {
        refundId: refund.id,
        orderId: order.id,
      },
    });
  }

  // Admin notification
  await AdminNotificationService.notify({
    type: "REFUND_REQUEST",

    title: "Refund Request",

    message: `${order.user.name ?? "A customer"} requested a refund.`,

    link: `/admin/refunds/${refund.id}`,

    metadata: {
      refundId: refund.id,
      orderId: order.id,
      customerId: order.userId,
      amount: requestedAmount,
      currency: order.currency,
    },
  });

  return refund;
}

export async function approveRefund(refundId: string) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      tenantId: tenant.id,
    },
    include: {
      order: true,
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund request not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Only requested refunds can be approved.");
  }

  const approvedRefund = await prisma.refundRequest.update({
    where: {
      id: refund.id,
    },
    data: {
      status: "APPROVED",
      approvedAmount: refund.requestedAmount,
    },
  });

  // ----------------------------
  // Customer Timeline
  // ----------------------------

  await prisma.orderTrackingEvent.create({
    data: {
      tenantId: tenant.id,
      orderId: refund.orderId,
      status: "PROCESSING",
      type: "REFUND",
      title: "Refund Approved",
      description:
        "Your refund request has been approved and will be processed shortly.",
    },
  });

  // ----------------------------
  // Vendor Notification
  // ----------------------------

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundApproved",
      type: "REFUND",
      title: "Refund Approved",
      message: `Refund request for Order #${refund.orderId.slice(-8)} has been approved.`,
      link: `/vendor/refunds/${refund.id}`,
      metadata: {
        refundId: refund.id,
        orderId: refund.orderId,
      },
    });
  }

  // ----------------------------
  // Admin Notification
  // ----------------------------

  await AdminNotificationService.notify({
    type: "REFUND_APPROVED",
    title: "Refund Approved",
    message: `Refund request for Order #${refund.orderId.slice(-8)} has been approved.`,
    link: `/admin/refunds/${refund.id}`,
    metadata: {
      refundId: refund.id,
      orderId: refund.orderId,
      customerId: refund.userId,
      customerName: refund.user.name,
      amount: refund.requestedAmount,
      currency: refund.currency,
    },
  });

  return approvedRefund;
}

export async function processRefund(refundId: string) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      tenantId: tenant.id,
    },
    include: {
      order: {
        include: {
          items: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              vendorId: true,
              name: true,
            },
          },
        },
      },
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "APPROVED") {
    throw new Error("Only approved refunds can be processed.");
  }

  // ----------------------------------
  // Mark as PROCESSING
  // ----------------------------------

  await prisma.refundRequest.update({
    where: {
      id: refund.id,
    },
    data: {
      status: "PROCESSING",
    },
  });

  // ----------------------------------
  // Call payment gateway
  // ----------------------------------

  const paymentResult = await refundPayment({
    amount: refund.approvedAmount ?? refund.requestedAmount,
    reference: refund.order.paymentReference!,
  });

  if (!paymentResult.success) {
    await prisma.refundRequest.update({
      where: {
        id: refund.id,
      },
      data: {
        status: "FAILED",
      },
    });

    throw new Error("Refund payment failed.");
  }

  if (!paymentResult.reference) {
    throw new Error("Gateway returned no refund reference.");
  }

  // ----------------------------------
  // Transaction
  // ----------------------------------

  await prisma.$transaction(async (tx) => {
    await tx.refundTransaction.create({
      data: {
        refundRequestId: refund.id,
        provider: paymentResult.provider,
        transactionRef: paymentResult.reference,
        status: "SUCCESS",
      },
    });

    await tx.refundRequest.update({
      where: {
        id: refund.id,
      },
      data: {
        status: "REFUNDED",
      },
    });

    await tx.order.update({
      where: {
        id: refund.orderId,
      },
      data: {
        refundStatus: "REFUNDED",
      },
    });

    // Restore inventory
    for (const item of refund.items) {
      await InventoryService.increaseStock({
        tx,
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    // Customer timeline
    await tx.orderTrackingEvent.create({
      data: {
        tenantId: tenant.id,
        orderId: refund.orderId,
        status: "REFUNDED",
        type: "REFUND",
        title: "Refund Completed",
        description:
          "Your refund has been processed successfully. Funds should appear shortly depending on your payment provider.",
      },
    });
  });

  // ----------------------------------
  // Vendor Notification
  // ----------------------------------

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundCompleted",
      type: "REFUND",
      title: "Refund Completed",
      message: `Refund completed for Order #${refund.orderId.slice(-8)}.`,
      link: `/vendor/refunds/${refund.id}`,
      metadata: {
        refundId: refund.id,
        orderId: refund.orderId,
        amount: refund.approvedAmount ?? refund.requestedAmount,
        currency: refund.currency,
      },
    });
  }

  // ----------------------------------
  // Admin Notification
  // ----------------------------------

  await AdminNotificationService.notify({
    type: "REFUNDED",
    title: "Refund Completed",
    message: `Refund completed for Order #${refund.orderId.slice(-8)}.`,
    link: `/admin/refunds/${refund.id}`,
    metadata: {
      refundId: refund.id,
      orderId: refund.orderId,
      customerId: refund.userId,
      customerName: refund.user.name,
      amount: refund.approvedAmount ?? refund.requestedAmount,
      currency: refund.currency,
    },
  });

  return {
    success: true,
  };
}

export async function rejectRefund(refundId: string, reason?: string) {
  const refund = await prisma.refundRequest.findUnique({
    where: { id: refundId },
    include: {
      order: true,
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Only pending refund requests can be rejected.");
  }

  await prisma.refundRequest.update({
    where: {
      id: refundId,
    },
    data: {
      status: "REJECTED",
    },
  });

  // Customer tracking timeline
  await prisma.orderTrackingEvent.create({
    data: {
      tenantId: refund.tenantId,
      orderId: refund.orderId,
      status: "REFUND_REJECTED",
      type: "REFUND",
      title: "Refund Request Rejected",
      description:
        reason ?? "Your refund request has been reviewed and rejected.",
    },
  });

  // Vendor
  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundProcessed",
      type: "REFUND",
      title: "Refund Rejected",
      message: `Refund request for Order #${refund.orderId.slice(-8)} was rejected.`,
      link: `/vendor/orders/${refund.orderId}`,
      metadata: {
        refundId,
      },
    });
  }

  // Admin
  await AdminNotificationService.notify({
    type: "REFUND_REJECTED",
    title: "Refund Rejected",
    message: `Refund request for Order #${refund.orderId.slice(-8)} has been rejected.`,
    link: `/admin/refunds/${refundId}`,
    metadata: {
      refundId,
      orderId: refund.orderId,
    },
  });

  return {
    success: true,
  };
}

export async function cancelRefund(refundId: string, userId: string) {
  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: refundId,
      userId,
    },
  });

  if (!refund) {
    throw new Error("Refund not found");
  }

  if (refund.status !== "REQUESTED") {
    throw new Error("Refund can no longer be cancelled.");
  }

  await prisma.refundRequest.update({
    where: {
      id: refundId,
    },
    data: {
      status: "CANCELLED",
    },
  });

  await prisma.orderTrackingEvent.create({
    data: {
      tenantId: refund.tenantId,
      orderId: refund.orderId,
      status: "REFUND_CANCELLED",
      type: "REFUND",
      title: "Refund Cancelled",
      description: "Customer cancelled the refund request.",
    },
  });

  if (refund.vendorId) {
    await NotificationService.notify({
      vendorId: refund.vendorId,
      setting: "refundProcessed",
      type: "REFUND",
      title: "Refund Cancelled",
      message: `Customer cancelled refund request for Order #${refund.orderId.slice(-8)}.`,
      link: `/vendor/orders/${refund.orderId}`,
      metadata: {
        refundId,
      },
    });
  }

  await AdminNotificationService.notify({
    type: "REFUND_CANCELLED",
    title: "Refund Cancelled",
    message: `Customer cancelled refund request for Order #${refund.orderId.slice(-8)}.`,
    link: `/admin/refunds/${refundId}`,
    metadata: {
      refundId,
    },
  });

  return {
    success: true,
  };
}
