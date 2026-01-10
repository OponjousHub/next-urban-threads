import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getPaymentProvider } from "@/app/lib/payments/factory";

export async function POST(req: Request) {
  const body = await req.json();

  const provider = getPaymentProvider(body.currency);

  const payment = await provider.initializePayment({
    email: body.email,
    amount: body.amount,
    currency: body.currency,
    orderId: body.orderId,
  });

  await prisma.order.update({
    where: { id: body.orderId },
    data: {
      paymentProvider: body.currency === "NGN" ? "PAYSTACK" : "FLUTTERWAVE",
      paymentReference: payment.reference,
    },
  });

  return NextResponse.json({ url: payment.authorizationUrl });
}
