import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { detectCountryFromHeaders } from "@/app/lib/payments/geo";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";
import { getLoggedInUserId } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 },
      );
    }

    // 2️⃣ Request body
    const {
      items,
      shippingAddress,
      addressId,
      paymentMethod,
      email,
      saveAddress,
    } = await req.json();
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    let shippingAddressId: string;

    if (addressId) {
      const userAddress = await prisma.address.findFirst({
        where: { id: addressId, userId },
      });

      if (!userAddress) {
        return NextResponse.json(
          { message: "Address not found" },
          { status: 400 },
        );
      }
      shippingAddressId = userAddress.id;
    } else {
      if (!shippingAddress) {
        return NextResponse.json(
          { message: "Shipping address required" },
          { status: 400 },
        );
      }

      if (saveAddress) {
        const newAddress = await prisma.address.create({
          data: {
            ...shippingAddress,
            userId,
            isDefault: false,
          },
        });

        shippingAddressId = newAddress.id;
      } else {
        // ❗ Create a TEMP address (not saved)
        const tempAddress = await prisma.address.create({
          data: {
            ...shippingAddress,
            userId,
            isTemporary: true, // optional but recommended
          },
        });

        shippingAddressId = tempAddress.id;
      }
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

    const paymentReference = crypto.randomUUID();

    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddressId,
        totalAmount,
        currency,
        paymentProvider: providerKey,
        paymentMethod,
        paymentReference, // set later
        items: {
          create: orderItems,
        },
      },
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentReference },
    });

    // 6️⃣ Initialize payment (factory → provider instance)
    const provider = getPaymentProvider(order.paymentProvider);

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
