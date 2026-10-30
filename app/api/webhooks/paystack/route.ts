import { NextResponse } from "next/server";
import crypto from "crypto";
import { PaymentProvider, PaymentStatus, OrderStatus } from "@prisma/client";

import { prisma } from "@/utils/prisma";
import { PaystackProvider } from "@/app/lib/payments/paystack";
import { finalizePayment } from "@/app/lib/payments/finalize-payment";

export async function POST(req: Request) {
  try {
    // 1. Confirm webhook secret is configured
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("PAYSTACK_SECRET_KEY is not configured.");

      return NextResponse.json(
        { message: "Payment provider configuration error" },
        { status: 500 },
      );
    }

    // 2. Get raw request body
    const body = await req.text();

    // 3. Get Paystack signature
    const signature = req.headers.get("x-paystack-signature");

    if (!signature || !/^[a-f0-9]{128}$/i.test(signature)) {
      return NextResponse.json(
        { message: "Invalid or missing Paystack signature" },
        { status: 401 },
      );
    }

    // 4. Verify signature using timing-safe comparison
    const expectedSignature = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    const expectedBuffer = Buffer.from(expectedSignature, "hex");
    const receivedBuffer = Buffer.from(signature, "hex");

    if (
      expectedBuffer.length !== receivedBuffer.length ||
      !crypto.timingSafeEqual(expectedBuffer, receivedBuffer)
    ) {
      return NextResponse.json(
        { message: "Invalid Paystack signature" },
        { status: 401 },
      );
    }

    // 5. Parse event
    let event: any;

    try {
      event = JSON.parse(body);
    } catch {
      return NextResponse.json(
        { message: "Invalid webhook payload" },
        { status: 400 },
      );
    }

    // Ignore events other than successful charges
    if (event.event !== "charge.success") {
      return NextResponse.json({ received: true });
    }

    const reference = event.data?.reference;

    if (typeof reference !== "string" || !reference.trim()) {
      return NextResponse.json(
        { message: "Missing payment reference" },
        { status: 400 },
      );
    }

    // 6. Find the matching RAYNTA order
    const order = await prisma.order.findFirst({
      where: {
        paymentReference: reference,
        paymentProvider: PaymentProvider.PAYSTACK,
      },
    });

    if (!order) {
      console.error("Paystack webhook: matching order not found.", {
        reference,
      });

      return NextResponse.json(
        { message: "Matching order not found" },
        { status: 404 },
      );
    }

    // 7. Verify the transaction directly with Paystack
    const provider = new PaystackProvider();

    const result = await provider.verifyPayment(reference);

    if (!result.success || result.status !== "successful") {
      console.warn("Paystack transaction not verified.", {
        orderId: order.id,
        reference,
        status: result.status,
      });

      return NextResponse.json(
        { message: "Payment not verified" },
        { status: 400 },
      );
    }

    // 8. Validate reference, amount and currency
    const expectedAmount = Number(order.totalAmount);
    const verifiedAmount = result.amount;

    const expectedCurrency = String(order.currency ?? "").toUpperCase();
    const verifiedCurrency = String(result.currency ?? "").toUpperCase();

    const referenceMatches = result.txRef === order.paymentReference;

    const amountMatches =
      typeof verifiedAmount === "number" &&
      Number.isFinite(verifiedAmount) &&
      Number.isFinite(expectedAmount) &&
      Math.round(verifiedAmount * 100) === Math.round(expectedAmount * 100);

    const currencyMatches =
      expectedCurrency !== "" &&
      verifiedCurrency !== "" &&
      expectedCurrency === verifiedCurrency;

    if (!referenceMatches || !amountMatches || !currencyMatches) {
      console.error("Paystack payment verification mismatch.", {
        orderId: order.id,
        referenceMatches,
        amountMatches,
        currencyMatches,
        expectedCurrency,
        verifiedCurrency,
      });

      return NextResponse.json(
        { message: "Payment details do not match the order" },
        { status: 400 },
      );
    }

    // 9. If already paid, retry unfinished finalization steps
    if (order.paymentStatus === PaymentStatus.PAID) {
      const finalization = await finalizePayment(order.id);

      if (!finalization.complete) {
        console.error("Paystack payment finalization incomplete.", {
          orderId: order.id,
          errors: finalization.errors,
        });

        return NextResponse.json(
          { message: "Payment received; finalization incomplete" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        received: true,
        alreadyProcessed: true,
      });
    }

    // Do not change cancelled or otherwise completed orders
    if (order.status !== OrderStatus.PENDING) {
      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    // 10. Mark payment as successful only if still pending
    const paymentUpdate = await prisma.order.updateMany({
      where: {
        id: order.id,
        paymentReference: reference,
        paymentProvider: PaymentProvider.PAYSTACK,
        paymentStatus: PaymentStatus.PENDING,
        status: OrderStatus.PENDING,
      },
      data: {
        paymentStatus: PaymentStatus.PAID,
        status: OrderStatus.PROCESSING,
        paymentTxRef: result.txRef,
      },
    });

    // 11. Handle a concurrent webhook or verification request
    if (paymentUpdate.count === 0) {
      const latestOrder = await prisma.order.findFirst({
        where: {
          id: order.id,
          paymentReference: reference,
          paymentProvider: PaymentProvider.PAYSTACK,
        },
      });

      if (latestOrder?.paymentStatus === PaymentStatus.PAID) {
        const finalization = await finalizePayment(order.id);

        if (!finalization.complete) {
          return NextResponse.json(
            { message: "Payment received; finalization incomplete" },
            { status: 500 },
          );
        }

        return NextResponse.json({
          received: true,
          alreadyProcessed: true,
        });
      }

      return NextResponse.json({
        received: true,
        ignored: true,
      });
    }

    // 12. Run RAYNTA's idempotent payment finalization
    const finalization = await finalizePayment(order.id);

    if (!finalization.complete) {
      console.error("Paystack payment finalization incomplete.", {
        orderId: order.id,
        errors: finalization.errors,
      });

      return NextResponse.json(
        { message: "Payment received; finalization incomplete" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      received: true,
      success: true,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
