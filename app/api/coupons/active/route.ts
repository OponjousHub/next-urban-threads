import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

import {
  getCouponCartLines,
  validateCouponForCart,
  serializeCoupon,
  CouponCartItem,
} from "@/app/lib/coupons/coupon-service";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json([], {
        status: 200,
      });
    }

    const body = await req.json();

    const items = (body.items as CouponCartItem[]) ?? [];

    if (!items.length) {
      return NextResponse.json([]);
    }

    const lines = await getCouponCartLines(tenant.id, items);

    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        tenantId: tenant.id,
        active: true,

        OR: [
          {
            startsAt: null,
          },
          {
            startsAt: {
              lte: now,
            },
          },
        ],

        AND: [
          {
            OR: [
              {
                expiresAt: null,
              },
              {
                expiresAt: {
                  gte: now,
                },
              },
            ],
          },
        ],

        // SINGLE_VENDOR:
        // Only store-wide coupons.
        //
        // MULTI_VENDOR:
        // Both store-wide and vendor coupons.
        ...(tenant.storeMode === "SINGLE_VENDOR"
          ? {
              vendorId: null,
            }
          : {}),
      },

      orderBy: {
        createdAt: "desc",
      },

      select: {
        id: true,
        code: true,
        description: true,
        type: true,
        value: true,
        minimumAmount: true,
        usageLimit: true,
        usedCount: true,
        startsAt: true,
        expiresAt: true,
        active: true,
        vendorId: true,
      },
    });

    const availableCoupons = [];

    for (const coupon of coupons) {
      try {
        validateCouponForCart(coupon, lines, tenant.storeMode, now);

        availableCoupons.push(serializeCoupon(coupon));
      } catch {
        // Coupon exists but is not applicable
        // to this particular cart.
      }
    }

    return NextResponse.json(availableCoupons);
  } catch (error) {
    console.error("[ACTIVE_COUPONS_ERROR]", error);

    return NextResponse.json([], {
      status: 500,
    });
  }
}
