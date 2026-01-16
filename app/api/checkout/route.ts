import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getPaymentProvider } from "@/app/lib/payments/factory";

import { Prisma } from "@prisma/client";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import crypto from "crypto";

export async function POST(req: Request) {
  const paymentReference = crypto.randomUUID();
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized: missing token!",
        },
        { status: 401 }
      );
    }

    const userId = AuthController.getUserIdFromToken(token);

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 }
      );
    }

    const { items, shippingAddress, paymentMethod, email } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    // Fetch products from DB
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

    // 1. Create order
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        currency: "NGN",
        paymentProvider: "PAYSTACK", // or FLUTTERWAVE"
        shippingAddress,
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
    console.log(order);

    // Initialize payment
    const provider = getPaymentProvider(order.currency);
    const payment = await provider.initializePayment({
      email,
      amount: order.totalAmount.toNumber(),
      reference: paymentReference, // ✅ UUID
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order/${order.id}`,
    });

    // Return payment URL
    return NextResponse.json(
      {
        orderId: order.id,
        paymentUrl: payment.authorizationUrl,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create order" },
      { status: 500 }
    );
  }
}
