import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { PaystackProvider } from "@/app/lib/payments/paystack";

export async function POST(req: Request) {
  try {
    // 1. Get raw body
    const body = await req.text();

    // 2. Get Paystack signature
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json(
        { message: "Missing Paystack signature" },
        { status: 400 }
      );
    }

    // 3. Verify signature
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // 4. Parse event
    const event = JSON.parse(body);

    // 5. Handle successful charge
    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // (Optional but recommended) verify again with Paystack API
      const provider = new PaystackProvider();
      const isPaid = await provider.verifyPayment(reference);

      if (!isPaid) {
        return NextResponse.json({ message: "Payment not verified" });
      }

      // 6. Update order
      await prisma.order.update({
        where: { paymentReference: reference },
        data: {
          status: "PAID",
        },
      });
    }
    console.log("🔥 Paystack webhook hit");

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook error:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}
