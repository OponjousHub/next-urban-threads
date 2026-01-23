import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import { cookies, headers } from "next/headers";
import crypto from "crypto";

import AuthController from "@/modules/auth/auth.controller";
import { detectCountryFromHeaders } from "@/app/lib/payments/geo";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";

export async function POST(req: NextRequest) {
  try {
    // 1️⃣ Auth
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized: missing token" },
        { status: 401 },
      );
    }

    const userId = AuthController.getUserIdFromToken(token);
    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 },
      );
    }

    // 2️⃣ Request body
    const { items, shippingAddress, paymentMethod, email } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // 3️⃣ Geo → payment config
    const country = await detectCountryFromHeaders();
    const { currency, provider: providerKey } = resolvePaymentConfig(country);

    // 4️⃣ Fetch products
    const products = await prisma.product.findMany({
      where: {
        id: { in: items.map((item: any) => item.productId) },
      },
    });

    let totalAmount = new Prisma.Decimal(0);

    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const lineTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.plus(lineTotal);

      return {
        productId: product.id,
        quantity: item.quantity,
        price: product.price,
      };
    });

    // 5️⃣ Create order
    const paymentReference = crypto.randomUUID();

    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        currency,
        paymentProvider: providerKey,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentReference,
        paymentMethod,
        items: {
          create: orderItems,
        },
      },
      include: {
        items: true,
      },
    });

    // 6️⃣ Initialize payment (factory → provider instance)
    const provider = getPaymentProvider(order.paymentProvider);
    console.log("Detected country:", country);
    console.log("Select Provider:", provider);

    const payment = await provider.initializePayment({
      email,
      amount: order.totalAmount.toNumber(),
      reference: order.paymentReference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order/${order.id}`,
    });

    // 7️⃣ Respond
    return NextResponse.json(
      {
        orderId: order.id,
        paymentUrl: payment.authorizationUrl,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 },
    );
  }
}
