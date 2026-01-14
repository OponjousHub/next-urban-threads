import { NextRequest, NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import { prisma } from "@/utils/prisma";
import { PaystackProvider } from "@/app/lib/payments/paystack";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function POST(req: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: missing token!" },
      { status: 401 }
    );
  }

  try {
    // ---------------------------
    // 1️⃣ Authenticate user
    // ---------------------------

    const userId = AuthController.getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
    }
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID required" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 2️⃣ Fetch order from DB
    // ---------------------------
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // ---------------------------
    // 3️⃣ If already PAID, return
    // ---------------------------
    if (order.status === "PAID") {
      return NextResponse.json({ order, message: "Order already paid" });
    }

    if (!order.paymentReference) {
      return NextResponse.json(
        { message: "No payment reference found" },
        { status: 400 }
      );
    }

    // ---------------------------
    // 4️⃣ Verify with Paystack
    // ---------------------------
    const provider = new PaystackProvider();
    const isPaid = await provider.verifyPayment(order.paymentReference);

    if (!isPaid) {
      return NextResponse.json({ order, message: "Payment not completed yet" });
    }

    // ---------------------------
    // 5️⃣ Update order status to PAID (idempotent)
    // ---------------------------
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    // ---------------------------
    // 6️⃣ Return updated order
    // ---------------------------
    return NextResponse.json({
      order: updatedOrder,
      message: "Payment verified successfully",
    });
  } catch (error) {
    console.error("POST /api/orders/me/[orderId]/verify error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
