import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";
import { Prisma } from "@prisma/client";
import crypto from "crypto";
import { detectCountryFromHeaders } from "@/app/lib/payments/geo";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: NextRequest) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
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
      couponId,
    } = await req.json();
    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    let shippingAddressId: string;

    if (addressId) {
      const userAddress = await prisma.address.findFirst({
        where: { id: addressId, userId, tenantId: tenant.id },
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
        const { email: _email, ...addressData } = shippingAddress;

        const newAddress = await prisma.address.create({
          data: {
            ...addressData,
            userId,
            tenantId: tenant.id,
            user: {
              connect: { id: userId },
            },
            isDefault: false,
          },
        });

        shippingAddressId = newAddress.id;
      } else {
        // ❗ Create a TEMP address (not saved)
        const { email: _email, ...addressData } = shippingAddress;

        const tempAddress = await prisma.address.create({
          data: {
            ...addressData,
            userId,
            tenantId: tenant.id,
            isTemporary: true,
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
        id: {
          in: items.map((item: any) => item.productId).filter(Boolean),
        },

        tenantId: tenant.id,
      },

      include: {
        variants: true,
      },
    });

    let totalAmount = new Prisma.Decimal(0);
    let discountAmount = new Prisma.Decimal(0);
    let coupon = null;

    // Get Coupon
    if (couponId) {
      coupon = await prisma.coupon.findFirst({
        where: {
          id: couponId,
          tenantId: tenant.id,
          vendorId: products[0]?.vendorId,
          active: true,
        },
      });
    }

    // Validate Coupon
    if (coupon) {
      const now = new Date();

      if (coupon.startsAt && coupon.startsAt > now) {
        throw new Error("Coupon is not active yet");
      }

      if (coupon.expiresAt && coupon.expiresAt < now) {
        throw new Error("Coupon has expired");
      }

      if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
        throw new Error("Coupon usage limit reached");
      }
    }

    console.log("TOTAL BEFORE DISCOUNT:", totalAmount.toString());
    console.log("COUPON TYPE:", coupon?.type);
    console.log("COUPON VALUE:", coupon?.value);

    // If Coupon is Valid, Calculate discount on server
    if (coupon) {
      if (coupon.type === "PERCENTAGE") {
        discountAmount = totalAmount.mul(Number(coupon.value) / 100);
      }

      if (coupon.type === "FIXED") {
        discountAmount = new Prisma.Decimal(coupon.value);
      }

      if (discountAmount.greaterThan(totalAmount)) {
        discountAmount = totalAmount;
      }

      totalAmount = totalAmount.minus(discountAmount);
    }

    console.log("DISCOUNT AMOUNT", discountAmount);

    const orderItems = items.map((item: any) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) throw new Error("Product not found");

      const lineTotal = product.price.mul(item.quantity);
      totalAmount = totalAmount.plus(lineTotal);

      const variant = product.variants.find((v) => v.id === item.variantId);

      return {
        productId: product.id,

        quantity: item.quantity,

        price: product.price,

        tenantId: tenant.id,

        variantId: variant?.id,

        variantColor: variant?.color,

        variantSize: variant?.size,

        image: variant?.image || product.images?.[0],
      };
    });

    console.log("TOTAL AFTER ITEMS:", totalAmount.toString());

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: {
          id: item.productId,
          tenantId: tenant.id,
        },
        include: {
          variants: true,
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      const variant = product.variants.find((v) => v.id === item.variantId);

      if (variant) {
        if (item.quantity > variant.stock) {
          throw new Error(`${product.name} only has ${variant.stock} left`);
        }
      } else {
        if (item.quantity > product.stock) {
          throw new Error(`${product.name} only has ${product.stock} left`);
        }
      }
    }

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    const paymentReference = crypto.randomUUID();

    const order = await prisma.order.create({
      data: {
        userId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        shippingAddressId,
        totalAmount,
        customerEmail: email || shippingAddress?.email || "",
        currency,
        paymentProvider: providerKey,
        paymentMethod,
        paymentReference,
        vendorId: products[0]?.vendorId,
        discountAmount,
        couponId: coupon?.id ?? null,
        items: {
          create: orderItems,
        },
      },
    });

    await prisma.order.update({
      where: { id: order.id, tenantId: tenant.id },
      data: { paymentReference },
    });

    // INITIALIZE TRACKING WITH STATUS = PENDING
    await prisma.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        tenantId: tenant.id,
        status: "PENDING",
        type: "SYSTEM",
        title: "Order placed",
        description: "Your order has been received and is awaiting processing",
        location: "Online",
      },
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
