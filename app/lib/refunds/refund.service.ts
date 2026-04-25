import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function createRefundRequest(data: {
  orderId: string;
  userId: string;
  tenantId: string;
  reason: string;
  description?: string;
  items: {
    productId: string;
    quantity: number;
    priceAtPurchase: number;
  }[];
}) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  // Fetch order from DB (SOURCE OF TRUTH)
  const order = await prisma.order.findUnique({
    where: { id: data.orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) throw new Error("Order not found");

  //  Validate ownership
  if (order.userId !== userId) {
    throw new Error("Not your order");
  }

  //  Calculate refund safely from DB
  let requestedAmount = 0;

  const refundItems = data.items.map((reqItem) => {
    const orderItem = order.items.find(
      (i) => i.productId === reqItem.productId,
    );

    if (!orderItem) throw new Error("Invalid item");

    if (reqItem.quantity > orderItem.quantity) {
      throw new Error("Invalid quantity");
    }

    const price = Number(orderItem.product.price);

    requestedAmount += +price * reqItem.quantity;

    return {
      productId: reqItem.productId,
      quantity: reqItem.quantity,
      priceAtPurchase: price,
    };
  });

  return prisma.refundRequest.create({
    data: {
      tenantId: order.tenantId,
      orderId: order.id,
      userId: userId,
      reason: data.reason,
      description: data.description,
      requestedAmount,
      currency: tenant.currency, // adjust later per tenant

      items: {
        create: refundItems,
      },
    },
  });
}

export async function approveRefund(refundId: string) {
  const refund = await prisma.refundRequest.findUnique({
    where: { id: refundId },
  });

  if (!refund) throw new Error("Refund not found");

  return prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      status: "APPROVED",
      approvedAmount: refund.requestedAmount,
    },
  });
}

export async function rejectRefund(refundId: string) {
  return prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      status: "REJECTED",
    },
  });
}
