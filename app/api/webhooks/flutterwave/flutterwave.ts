import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { FlutterwaveProvider } from "@/app/lib/payments/flutterwave";
import orderConfirmationEmail from "@/app/lib/email/template/orderConfirmation";
import { sendEmail } from "@/app/lib/email/sendEmail";

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("verif-hash");

    if (!signature || signature !== process.env.FLUTTERWAVE_WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);

    if (event.event === "charge.completed") {
      const reference = event.data.tx_ref;

      const provider = new FlutterwaveProvider();
      const isPaid = await provider.verifyPayment(reference);

      if (!isPaid) {
        return NextResponse.json({ message: "Payment not verified" });
      }

      const order = await prisma.order.update({
        where: { paymentReference: reference },
        data: { status: "PAID" },
        include: {
          user: true,
          items: {
            include: { product: true },
          },
          shippingAddress: true,
        },
      });

      //SEND EMAIL
      const template = orderConfirmationEmail(order);

      await sendEmail({
        to: order.user.email,
        subject: template.subject,
        html: template.html,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Flutterwave webhook error:", error);
    return NextResponse.json({ message: "Webhook error" }, { status: 500 });
  }
}
