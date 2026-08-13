import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json([], { status: 200 });
    }

    const now = new Date();

    const coupons = await prisma.coupon.findMany({
      where: {
        tenantId: tenant.id,
        active: true,

        ...(tenant.storeMode === "SINGLE_VENDOR"
          ? {
              vendorId: null,
            }
          : {}),

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
        vendorId: true,
        usageLimit: true,
        usedCount: true,
      },
    });

    const availableCoupons = coupons
      .filter(
        (coupon) =>
          coupon.usageLimit === null || coupon.usedCount < coupon.usageLimit,
      )
      .map((coupon) => ({
        id: coupon.id,
        code: coupon.code,
        description: coupon.description,
        type: coupon.type,
        value: Number(coupon.value),
        vendorId: coupon.vendorId,
      }));

    return NextResponse.json(availableCoupons);
  } catch (error) {
    console.error("[ACTIVE_COUPONS_ERROR]", error);

    return NextResponse.json(
      {
        message: "Failed to load available coupons",
      },
      { status: 500 },
    );
  }
}
