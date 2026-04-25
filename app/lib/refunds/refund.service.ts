import { prisma } from "@/utils/prisma";

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
  const requestedAmount = data.items.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0,
  );

  return prisma.refundRequest.create({
    data: {
      tenantId: data.tenantId,
      orderId: data.orderId,
      userId: data.userId,
      reason: data.reason,
      description: data.description,
      requestedAmount,
      currency: "NGN", // adjust later per tenant

      items: {
        create: data.items,
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
