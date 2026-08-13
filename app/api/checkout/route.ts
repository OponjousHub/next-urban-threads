import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";
import { Prisma, PaymentStatus, OrderStatus } from "@prisma/client";
import crypto from "crypto";

import { detectCountryFromHeaders } from "@/app/lib/payments/geo";
import { resolvePaymentConfig } from "@/app/lib/payments/payment";
import { getPaymentProvider } from "@/app/lib/payments/factory";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

import NotificationService from "@/lib/notifications/notification.service";
import InventoryService from "@/lib/inventory/inventory.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Default tenant not found" },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 },
      );
    }

    // ---------------------------------------------------------
    // 2. Request body
    // ---------------------------------------------------------

    const {
      items,
      shippingAddress,
      addressId,
      paymentMethod,
      email,
      saveAddress,
      couponId,
      shippingMethodId,
    } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: "Cart is empty" }, { status: 400 });
    }

    if (!shippingMethodId) {
      return NextResponse.json(
        {
          message: "No shipping method is available for the selected address.",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 3. Resolve shipping address
    // ---------------------------------------------------------

    let shippingAddressId: string;

    let resolvedShippingAddress: {
      country: string;
      state: string | null;
      city: string;
    };

    if (addressId) {
      const userAddress = await prisma.address.findFirst({
        where: {
          id: addressId,
          userId,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          country: true,
          state: true,
          city: true,
        },
      });

      if (!userAddress) {
        return NextResponse.json(
          { message: "Address not found" },
          { status: 400 },
        );
      }

      shippingAddressId = userAddress.id;

      resolvedShippingAddress = {
        country: userAddress.country,
        state: userAddress.state,
        city: userAddress.city,
      };
    } else {
      if (!shippingAddress) {
        return NextResponse.json(
          { message: "Shipping address required" },
          { status: 400 },
        );
      }

      if (
        !shippingAddress.country ||
        !shippingAddress.state ||
        !shippingAddress.city
      ) {
        return NextResponse.json(
          {
            message: "Country, state and city are required for shipping.",
          },
          { status: 400 },
        );
      }

      resolvedShippingAddress = {
        country: shippingAddress.country,
        state: shippingAddress.state,
        city: shippingAddress.city,
      };

      if (saveAddress) {
        const { email: _email, ...addressData } = shippingAddress;

        const newAddress = await prisma.address.create({
          data: {
            ...addressData,
            userId,
            tenantId: tenant.id,
            isDefault: false,
          },
        });

        shippingAddressId = newAddress.id;
      } else {
        // Temporary checkout address
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

    // ---------------------------------------------------------
    // 4. Fetch products
    // ---------------------------------------------------------

    const productIds = items.map((item: any) => item.productId).filter(Boolean);

    const products = await prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
        tenantId: tenant.id,
      },
      include: {
        variants: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "One or more products could not be found." },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 5. Calculate merchandise subtotal
    // ---------------------------------------------------------

    let merchandiseSubtotal = new Prisma.Decimal(0);

    for (const item of items) {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        return NextResponse.json(
          { message: "Product not found" },
          { status: 400 },
        );
      }

      const variant = product.variants.find(
        (variant) => variant.id === item.variantId,
      );

      // Inventory validation
      if (variant) {
        if (item.quantity > variant.stock) {
          return NextResponse.json(
            {
              message: `${product.name} only has ${variant.stock} left`,
            },
            { status: 400 },
          );
        }
      } else {
        if (item.quantity > product.stock) {
          return NextResponse.json(
            {
              message: `${product.name} only has ${product.stock} left`,
            },
            { status: 400 },
          );
        }
      }

      merchandiseSubtotal = merchandiseSubtotal.plus(
        product.price.mul(item.quantity),
      );
    }

    // ---------------------------------------------------------
    // 6. Find the customer's shipping zone
    // ---------------------------------------------------------
    //
    // IMPORTANT:
    // ShippingZone.country uses ISO country codes such as:
    // NG, US, GB, etc.
    //
    // ShippingZone.states contains state names.
    // ---------------------------------------------------------

    const shippingZone = await prisma.shippingZone.findFirst({
      where: {
        tenantId: tenant.id,
        active: true,
        country: resolvedShippingAddress.country,
        states: {
          has: resolvedShippingAddress.state || "",
        },
      },
    });

    if (!shippingZone) {
      return NextResponse.json(
        {
          message: "Sorry, we don't currently ship to the selected address.",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 7. Validate the selected shipping method
    // ---------------------------------------------------------
    //
    // The method MUST belong to the shipping zone that matches
    // the customer's address.
    // ---------------------------------------------------------

    const shippingMethod = await prisma.shippingMethod.findFirst({
      where: {
        id: shippingMethodId,
        tenantId: tenant.id,
        zoneId: shippingZone.id,
        active: true,
      },
    });

    if (!shippingMethod) {
      return NextResponse.json(
        {
          message:
            "The selected shipping method is not available for this address.",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 8. Find an applicable shipping rate
    // ---------------------------------------------------------
    //
    // We DO NOT trust the shipping price sent by the browser.
    // The server determines the rate itself.
    // ---------------------------------------------------------

    const shippingRates = await prisma.shippingRate.findMany({
      where: {
        tenantId: tenant.id,
        zoneId: shippingZone.id,
        methodId: shippingMethod.id,
        active: true,
      },
      orderBy: [
        {
          priority: "asc",
        },
        {
          amount: "asc",
        },
      ],
    });

    const applicableRates = shippingRates.filter((rate) => {
      const subtotal = merchandiseSubtotal.toNumber();

      const minOrderValid =
        rate.minOrderAmount == null || subtotal >= Number(rate.minOrderAmount);

      const maxOrderValid =
        rate.maxOrderAmount == null || subtotal <= Number(rate.maxOrderAmount);

      return minOrderValid && maxOrderValid;
    });

    const shippingRate = applicableRates[0];

    if (!shippingRate) {
      return NextResponse.json(
        {
          message:
            "Sorry, there is no shipping rate available for the selected address and order.",
        },
        { status: 400 },
      );
    }

    const shippingCost = new Prisma.Decimal(shippingRate.amount);

    // ---------------------------------------------------------
    // 9. Coupon
    // ---------------------------------------------------------

    let discountAmount = new Prisma.Decimal(0);
    let coupon = null;

    if (couponId) {
      coupon = await prisma.coupon.findFirst({
        where: {
          id: couponId,
          tenantId: tenant.id,
          active: true,
        },
      });

      if (!coupon) {
        return NextResponse.json(
          {
            message: "The selected coupon is no longer available.",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // STORE MODE VALIDATION
      // -------------------------------------------------------

      if (tenant.storeMode === "SINGLE_VENDOR" && coupon.vendorId !== null) {
        return NextResponse.json(
          {
            message: "This coupon is not available in this store.",
          },
          { status: 400 },
        );
      }

      const now = new Date();

      // -------------------------------------------------------
      // Coupon date validation
      // -------------------------------------------------------

      if (coupon.startsAt && coupon.startsAt > now) {
        return NextResponse.json(
          {
            message: "Coupon is not active yet.",
          },
          { status: 400 },
        );
      }

      if (coupon.expiresAt && coupon.expiresAt < now) {
        return NextResponse.json(
          {
            message: "Coupon has expired.",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // Minimum order validation
      // -------------------------------------------------------

      if (
        coupon.minimumAmount !== null &&
        merchandiseSubtotal.lessThan(coupon.minimumAmount)
      ) {
        return NextResponse.json(
          {
            message: `This coupon requires a minimum order of ${coupon.minimumAmount}.`,
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // Usage limit
      // -------------------------------------------------------

      if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        return NextResponse.json(
          {
            message: "Coupon usage limit reached.",
          },
          { status: 400 },
        );
      }

      // -------------------------------------------------------
      // Vendor-specific coupon
      // -------------------------------------------------------

      if (coupon.vendorId) {
        if (tenant.storeMode !== "MULTI_VENDOR") {
          return NextResponse.json(
            {
              message: "Vendor coupons are not available in this store.",
            },
            { status: 400 },
          );
        }

        const invalidProduct = products.find(
          (product) => product.vendorId !== coupon!.vendorId,
        );

        if (invalidProduct) {
          return NextResponse.json(
            {
              message: `Coupon "${coupon.code}" is only valid for products from its assigned vendor.`,
            },
            { status: 400 },
          );
        }
      }

      // -------------------------------------------------------
      // Calculate discount
      // -------------------------------------------------------

      if (coupon.type === "PERCENTAGE") {
        discountAmount = merchandiseSubtotal.mul(Number(coupon.value) / 100);
      }

      if (coupon.type === "FIXED") {
        discountAmount = new Prisma.Decimal(coupon.value);
      }

      // Never discount more than the merchandise subtotal
      if (discountAmount.greaterThan(merchandiseSubtotal)) {
        discountAmount = merchandiseSubtotal;
      }
    }

    // ---------------------------------------------------------
    // 10. Final server-side total
    // ---------------------------------------------------------
    //
    // Shipping is added ONCE per order.
    // Discount applies to merchandise subtotal.
    // ---------------------------------------------------------

    const discountedSubtotal = merchandiseSubtotal.minus(discountAmount);

    const totalAmount = discountedSubtotal.plus(shippingCost);

    // ---------------------------------------------------------
    // 11. Email validation
    // ---------------------------------------------------------

    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 12. Payment configuration
    // ---------------------------------------------------------

    const country = await detectCountryFromHeaders();

    const { currency, provider: providerKey } = resolvePaymentConfig(country);

    // ---------------------------------------------------------
    // 13. Create order items
    // ---------------------------------------------------------

    const orderItems = items.map((item: any) => {
      const product = products.find((product) => product.id === item.productId);

      if (!product) {
        throw new Error("Product not found");
      }

      const variant = product.variants.find(
        (variant) => variant.id === item.variantId,
      );

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

    // ---------------------------------------------------------
    // 14. Create payment reference
    // ---------------------------------------------------------

    const paymentReference = crypto.randomUUID();

    // ---------------------------------------------------------
    // 15. Load customer
    // ---------------------------------------------------------

    const customer = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    });

    // ---------------------------------------------------------
    // 16. Create order
    // ---------------------------------------------------------

    const order = await prisma.order.create({
      data: {
        userId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,

        shippingAddressId,

        totalAmount,
        customerEmail: email,
        currency: tenant.currency,

        paymentProvider: providerKey,
        paymentMethod,
        paymentReference,

        vendorId: products[0]?.vendorId,

        discountAmount,

        couponId: coupon?.id ?? null,

        shippingMethodId: shippingMethod.id,
        shippingCost,

        items: {
          create: orderItems,
        },
      },
    });

    // ---------------------------------------------------------
    // 17. Admin notification
    // ---------------------------------------------------------

    await AdminNotificationService.notify({
      type: "NEW_ORDER",
      title: "🛒 New Order",
      message: `${customer?.name ?? "A customer"} placed an order worth ${
        order.currency
      } ${Number(order.totalAmount).toLocaleString()}.`,
      link: `/admin/orders/${order.id}`,
      metadata: {
        orderId: order.id,
        customerId: userId,
        customerName: customer?.name,
        total: Number(order.totalAmount),
        currency: order.currency,
      },
    });

    // ---------------------------------------------------------
    // 18. Decrease stock
    // ---------------------------------------------------------

    for (const item of orderItems) {
      await InventoryService.decreaseStock({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }

    // ---------------------------------------------------------
    // 19. Vendor notification
    // ---------------------------------------------------------

    if (order.vendorId) {
      await NotificationService.notify({
        vendorId: order.vendorId,
        setting: "newOrder",
        type: "ORDER",
        title: "New Order",
        message: `You received a new order (${order.id.slice(-8)}).`,
        link: `/vendor/orders/${order.id}`,
        metadata: {
          orderId: order.id,
        },
      });
    }

    // ---------------------------------------------------------
    // 20. Initialize order tracking
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // 21. Initialize payment
    // ---------------------------------------------------------

    const provider = getPaymentProvider(order.paymentProvider);

    const payment = await provider.initializePayment({
      email,
      amount: order.totalAmount.toNumber(),
      reference: order.paymentReference,
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/order/${order.id}`,
    });

    // ---------------------------------------------------------
    // 22. Respond
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        orderId: order.id,
        paymentUrl: payment.authorizationUrl,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("[CHECKOUT_ERROR]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Failed to create order",
      },
      {
        status: 500,
      },
    );
  }
}
