import { refundPayment } from "../payments/refundPayment";
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
  const refundItems = data.items.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    priceAtPurchase: item.priceAtPurchase,
  }));

  const requestedAmount = refundItems.reduce(
    (sum, item) => sum + item.priceAtPurchase * item.quantity,
    0,
  );
  // let requestedAmount = 0;

  // const refundItems = data.items.map((reqItem) => {
  //   const orderItem = order.items.find(
  //     (i) => i.productId === reqItem.productId,
  //   );

  //   if (!orderItem) throw new Error("Invalid item");

  //   if (reqItem.quantity > orderItem.quantity) {
  //     throw new Error("Invalid quantity");
  //   }

  //   const price = Number(orderItem.product.price);

  //   requestedAmount += +price * reqItem.quantity;

  //   return {
  //     productId: reqItem.productId,
  //     quantity: reqItem.quantity,
  //     priceAtPurchase: price,
  //   };
  // });

  return prisma.refundRequest.create({
    data: {
      tenantId: order.tenantId,
      orderId: order.id,
      userId: userId,
      vendorId: null,
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
    include: {
      order: true,
    },
  });

  if (!refund) throw new Error("Refund not found");

  // ✅ PREVENT DOUBLE / INVALID REFUNDS
  if (refund.status !== "REQUESTED") {
    return { error: "Refund already processed or invalid state" };
  }

  // STEP 1: mark as processing
  const refundStatus = await prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      status: "PROCESSING",
      approvedAmount: refund.requestedAmount,
    },
  });

  // STEP 2: call payment gateway
  const paymentResult = await refundPayment({
    amount: refund.approvedAmount ?? refund.requestedAmount,
    reference: refund.order.paymentReference!,
  });

  if (paymentResult.reference === "already_refunded") {
    console.log("Refund already processed externally");

    await prisma.refundRequest.update({
      where: { id: refundId },
      data: { status: "REFUNDED" },
    });

    return { success: true };
  }

  // STEP 3: save transaction
  await prisma.refundTransaction.create({
    data: {
      refundRequestId: refundId,
      provider: paymentResult.provider,
      transactionRef: paymentResult.reference,
      status: "SUCCESS",
    },
  });

  // STEP 4: mark refunded
  await prisma.refundRequest.update({
    where: { id: refundId },
    data: { status: "REFUNDED" },
  });

  // STEP 5: update order
  await prisma.order.update({
    where: { id: refund.orderId },
    data: {
      refundStatus: "REFUNDED",
    },
  });

  return { success: true };
}

export async function rejectRefund(refundId: string) {
  return prisma.refundRequest.update({
    where: { id: refundId },
    data: {
      status: "REJECTED",
    },
  });
}
