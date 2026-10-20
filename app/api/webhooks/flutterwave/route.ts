import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";
import orderConfirmationEmail from "@/app/lib/email/template/orderConfirmation";
import { sendEmail } from "@/app/lib/email/sendEmail";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("verif-hash");

    if (
      !signature ||
      !process.env.FLUTTERWAVE_WEBHOOK_SECRET ||
      signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET
    ) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);

    if (event.event !== "charge.completed") {
      return NextResponse.json({ received: true });
    }

    const reference = event.data?.tx_ref;

    if (typeof reference !== "string" || !reference.trim()) {
      return NextResponse.json(
        { message: "Missing transaction reference" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findUnique({
      where: { paymentReference: reference },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
        shippingAddress: true,
        orderCoupons: {
          select: {
            couponId: true,
          },
        },
      },
    });

    if (!order) {
      console.warn("Flutterwave webhook: order not found", { reference });

      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // Already paid: acknowledge the repeated webhook without resending email.
    if (order.paymentStatus === "PAID") {
      return NextResponse.json({ received: true, alreadyProcessed: true });
    }

    const provider = new FlutterwaveProvider();
    const verification = await provider.verifyPayment(reference);

    if (
      !verification.success ||
      verification.status !== "successful" ||
      verification.txRef !== order.paymentReference
    ) {
      console.warn("Flutterwave webhook verification rejected", {
        reference,
        status: verification.status,
        success: verification.success,
      });

      return NextResponse.json(
        { message: "Payment not verified" },
        { status: 400 },
      );
    }

    const expectedAmount = Number(order.totalAmount);
    const verifiedAmount = verification.amount;

    const expectedCurrency = String(order.currency ?? "").toUpperCase();
    const verifiedCurrency = String(verification.currency ?? "").toUpperCase();

    const amountMatches =
      typeof verifiedAmount === "number" &&
      Number.isFinite(verifiedAmount) &&
      Number.isFinite(expectedAmount) &&
      Math.round(verifiedAmount * 100) === Math.round(expectedAmount * 100);

    const currencyMatches =
      expectedCurrency !== "" &&
      verifiedCurrency !== "" &&
      expectedCurrency === verifiedCurrency;

    if (!amountMatches || !currencyMatches) {
      console.error("Flutterwave webhook amount/currency mismatch", {
        orderId: order.id,
        amountMatches,
        currencyMatches,
        expectedCurrency,
        verifiedCurrency,
      });

      return NextResponse.json(
        { message: "Payment amount or currency mismatch" },
        { status: 400 },
      );
    }

    // Conditional update prevents a repeated webhook from processing an order
    // that another request has already marked as paid.
    const paymentUpdate = await prisma.order.updateMany({
      where: {
        id: order.id,
        tenantId: order.tenantId,
        paymentProvider: "FLUTTERWAVE",
        paymentStatus: "PENDING",
        status: "PENDING",
        paymentReference: reference,
      },
      data: {
        paymentStatus: "PAID",
        status: "PROCESSING",
        paymentTxRef: verification.txRef,
        flutterwaveTransactionId:
          verification.transactionId !== undefined
            ? String(verification.transactionId)
            : undefined,
      },
    });

    if (paymentUpdate.count === 0) {
      const latestOrder = await prisma.order.findUnique({
        where: { id: order.id },
        select: { paymentStatus: true },
      });

      if (latestOrder?.paymentStatus === "PAID") {
        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      return NextResponse.json(
        { message: "Order payment state changed; retry verification" },
        { status: 409 },
      );
    }

    const updatedOrder = await prisma.order.findUniqueOrThrow({
      where: { id: order.id },
      include: {
        user: true,
        items: {
          include: { product: true },
        },
        shippingAddress: true,
      },
    });

    const template = orderConfirmationEmail(updatedOrder);

    await sendEmail({
      to: updatedOrder.user.email,
      subject: template.subject,
      html: template.html,
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);

    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
