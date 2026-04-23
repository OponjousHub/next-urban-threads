import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { PaystackProvider } from "@/app/lib/payments/paystack";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const body = await req.json().catch(() => ({}));
  const referenceFromClient = body.reference;

  try {
    // ---------------------------
    // 1️⃣ Authenticate user
    // ---------------------------
    const userId = await getLoggedInUserId();
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { orderId } = await params;

    // ---------------------------;
    // 2️⃣ Fetch order + items
    // ---------------------------
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        tenantId: tenant.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    // console.log("ORDERSSS", order);

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    if (!order.paymentReference && referenceFromClient) {
      await prisma.order.update({
        where: { id: order.id, tenantId: tenant.id },
        data: { paymentReference: referenceFromClient },
      });

      order.paymentReference = referenceFromClient;
    }

    // ---------------------------
    // 3️⃣ Only verify if still pending
    // ---------------------------
    if (order.status !== "PENDING") {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 4️⃣ No reference → cannot verify
    // ---------------------------
    if (!order.paymentReference) {
      return NextResponse.json(order);
    }

    // ---------------------------
    // 5️⃣ Verify with Paystack
    // ---------------------------
    let provider;

    if (order.paymentProvider === "PAYSTACK") {
      provider = new PaystackProvider();
    } else {
      provider = new FlutterwaveProvider();
    }

    const isPaid = await provider.verifyPayment(order.paymentReference);

    if (!isPaid) {
      // Still pending → return order as-is
      return NextResponse.json(order);
    }

    // ---------------------------
    // 6️⃣ Mark as PAID (idempotent)
    // ---------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: order.id, tenantId: tenant.id },
      data: { paymentStatus: "PAID", status: "PROCESSING" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    await prisma.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        tenantId: tenant.id,
        status: "PROCESSING",
        type: "STATUS_CHANGE",
        title: "Payment confirmed",
        description:
          "Your payment was successful. We are now processing your order.",
      },
    });

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
