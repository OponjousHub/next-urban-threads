import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { code, subtotal, productIds } = await req.json();

    const { tenant } = await getAuthPayload();

    if (!tenant?.id) {
      return NextResponse.json(
        {
          valid: false,
          message: "Tenant not found",
        },
        { status: 400 },
      );
    }

    if (!code?.trim()) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon code is required",
        },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.trim().toUpperCase(),
        tenantId: tenant.id,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // STORE MODE
    // ---------------------------------------------------------

    if (tenant.storeMode === "SINGLE_VENDOR" && coupon.vendorId !== null) {
      return NextResponse.json(
        {
          valid: false,
          message: "This coupon is not available in this store.",
        },
        { status: 400 },
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon is inactive",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    // ---------------------------------------------------------
    // DATE VALIDATION
    // ---------------------------------------------------------

    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon has not started yet",
        },
        { status: 400 },
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon has expired",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // USAGE LIMIT
    // ---------------------------------------------------------

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon usage limit reached",
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // MINIMUM ORDER
    // ---------------------------------------------------------

    if (
      coupon.minimumAmount !== null &&
      Number(subtotal) < Number(coupon.minimumAmount)
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order amount is ${Number(
            coupon.minimumAmount,
          ).toLocaleString()}`,
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // VENDOR COUPON
    // ---------------------------------------------------------

    if (coupon.vendorId) {
      if (tenant.storeMode !== "MULTI_VENDOR") {
        return NextResponse.json(
          {
            valid: false,
            message: "Vendor coupons are not available in this store.",
          },
          { status: 400 },
        );
      }

      if (!Array.isArray(productIds) || productIds.length === 0) {
        return NextResponse.json(
          {
            valid: false,
            message:
              "Add products to your cart before applying this vendor coupon.",
          },
          { status: 400 },
        );
      }

      const matchingProducts = await prisma.product.count({
        where: {
          id: {
            in: productIds,
          },
          tenantId: tenant.id,
          vendorId: coupon.vendorId,
        },
      });

      if (matchingProducts !== productIds.length) {
        return NextResponse.json(
          {
            valid: false,
            message:
              "This coupon is only valid for products from its assigned vendor.",
          },
          { status: 400 },
        );
      }
    }

    // ---------------------------------------------------------
    // RESPONSE
    // ---------------------------------------------------------

    return NextResponse.json({
      valid: true,

      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
    });
  } catch (error) {
    console.error("[COUPON_VALIDATE_ERROR]", error);

    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate coupon",
      },
      { status: 500 },
    );
  }
}
