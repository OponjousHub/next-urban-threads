import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

import {
  CouponCartItem,
  getCouponCartLines,
  validateCouponForCart,
  applyCouponDiscountToLines,
  serializeCoupon,
} from "@/app/lib/coupons/coupon-service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const code = String(body.code ?? "")
      .trim()
      .toUpperCase();

    const items = (body.items as CouponCartItem[]) ?? [];

    const appliedCouponIds = Array.isArray(body.appliedCouponIds)
      ? body.appliedCouponIds.filter(
          (id: unknown): id is string => typeof id === "string",
        )
      : [];

    if (!code) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon code is required.",
        },
        { status: 400 },
      );
    }

    if (!items.length) {
      return NextResponse.json(
        {
          valid: false,
          message: "Your cart is empty.",
        },
        { status: 400 },
      );
    }

    const { tenant } = await getAuthPayload();

    if (!tenant?.id) {
      return NextResponse.json(
        {
          valid: false,
          message: "Tenant not found.",
        },
        { status: 400 },
      );
    }

    const lines = await getCouponCartLines(tenant.id, items);

    const allIds = [...appliedCouponIds, code];

    const coupons = await prisma.coupon.findMany({
      where: {
        tenantId: tenant.id,
        OR: [
          {
            id: {
              in: appliedCouponIds,
            },
          },
          {
            code,
          },
        ],
      },
    });

    const couponById = new Map(coupons.map((coupon) => [coupon.id, coupon]));

    const candidateCoupon = coupons.find((coupon) => coupon.code === code);

    if (!candidateCoupon) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon not found.",
        },
        { status: 404 },
      );
    }

    // Prevent applying the same coupon twice.
    if (appliedCouponIds.includes(candidateCoupon.id)) {
      return NextResponse.json(
        {
          valid: false,
          message: `Coupon "${candidateCoupon.code}" is already applied.`,
        },
        { status: 400 },
      );
    }

    // Rebuild the exact current stack.
    const stackIds = [...appliedCouponIds, candidateCoupon.id];

    if (new Set(stackIds).size !== stackIds.length) {
      return NextResponse.json(
        {
          valid: false,
          message: "A coupon cannot be applied more than once.",
        },
        { status: 400 },
      );
    }

    let workingLines = lines.map((line) => ({
      ...line,
      remaining: line.remaining,
    }));

    const calculations = [];

    for (const couponId of stackIds) {
      const coupon = couponById.get(couponId);

      if (!coupon) {
        return NextResponse.json(
          {
            valid: false,
            message: "One of the applied coupons is no longer available.",
          },
          { status: 400 },
        );
      }

      const calculation = validateCouponForCart(
        coupon,
        workingLines,
        tenant.storeMode,
      );

      calculations.push(calculation);

      applyCouponDiscountToLines(
        workingLines,
        coupon,
        calculation.discountAmount,
      );
    }

    const totalDiscount = calculations.reduce(
      (sum, calculation) => sum.plus(calculation.discountAmount),
      new (require("@prisma/client").Prisma.Decimal)(0),
    );

    const serializedCandidate = serializeCoupon(candidateCoupon);

    return NextResponse.json({
      valid: true,

      coupon: serializedCandidate,

      totalDiscount: totalDiscount.toNumber(),

      discounts: calculations.map((calculation) => ({
        couponId: calculation.couponId,

        code: calculation.code,

        discountAmount: calculation.discountAmount.toNumber(),
      })),
    });
  } catch (error) {
    console.error("[VALIDATE_COUPON_ERROR]", error);

    return NextResponse.json(
      {
        valid: false,
        message:
          error instanceof Error ? error.message : "Failed to validate coupon.",
      },
      { status: 400 },
    );
  }
}
