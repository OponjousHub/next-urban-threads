import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { PaystackProvider } from "@/app/lib/payments/paystack";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  console.log("backend verify GET hit");

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

    const { orderId } = params;

    // ---------------------------;
    // 2️⃣ Fetch order + items
    // ---------------------------
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
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
        where: { id: order.id },
        data: { paymentReference: referenceFromClient },
      });

      order.paymentReference = referenceFromClient;
    }

    // ---------------------------
    // 3️⃣ If already PAID → return immediately
    // ---------------------------
    if (order.status === "PAID") {
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
    // const provider = new PaystackProvider();
    let provider;

    if (order.paymentProvider === "PAYSTACK") {
      provider = new PaystackProvider();
    } else {
      provider = new FlutterwaveProvider();
    }
    console.log("This is the service provider:", provider);
    console.log("This is the ORDER.payment provider:", order.paymentProvider);
    const isPaid = await provider.verifyPayment(order.paymentReference);

    if (!isPaid) {
      // Still pending → return order as-is
      return NextResponse.json(order);
    }

    // ---------------------------
    // 6️⃣ Mark as PAID (idempotent)
    // ---------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    console.log("UPDATED ORDERSSSSSS:", updatedOrder);
    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error("Verify order error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
