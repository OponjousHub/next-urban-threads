"use server";

import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { Prisma } from "@prisma/client";

type CreateCouponData = {
  vendorId?: string | null;

  code: string;

  description?: string;

  type: "PERCENTAGE" | "FIXED";

  value: string | number;

  minimumOrderAmount?: string | number | null;

  usageLimit?: string | number | null;

  startsAt?: string | null;

  expiresAt?: string | null;

  active?: boolean;
};

export async function createCoupon(data: CreateCouponData) {
  const { tenant } = await getAuthPayload();

  if (!tenant?.id) {
    throw new Error("Tenant not found");
  }

  const code = data.code.trim().toUpperCase();

  if (!code) {
    throw new Error("Coupon code is required.");
  }

  const value = Number(data.value);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Discount value must be greater than zero.");
  }

  if (data.type === "PERCENTAGE" && value > 100) {
    throw new Error("Percentage discount cannot exceed 100%.");
  }

  // ---------------------------------------------------------
  // Store mode rules
  // ---------------------------------------------------------

  if (tenant.storeMode === "SINGLE_VENDOR" && data.vendorId) {
    throw new Error("Vendor coupons are not available in single-vendor mode.");
  }

  // ---------------------------------------------------------
  // Vendor validation
  // ---------------------------------------------------------

  if (tenant.storeMode === "MULTI_VENDOR" && data.vendorId) {
    const vendor = await prisma.vendor.findFirst({
      where: {
        id: data.vendorId,
        tenantId: tenant.id,
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      throw new Error("Vendor not found for this store.");
    }
  }

  // ---------------------------------------------------------
  // Unique code
  // ---------------------------------------------------------

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      code,
    },
    select: {
      id: true,
    },
  });

  if (existingCoupon) {
    throw new Error(
      `Coupon code "${code}" already exists. Please choose another code.`,
    );
  }

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,

        description: data.description?.trim() || null,

        type: data.type,

        value,

        minimumAmount:
          data.minimumOrderAmount !== undefined &&
          data.minimumOrderAmount !== null &&
          data.minimumOrderAmount !== ""
            ? Number(data.minimumOrderAmount)
            : null,

        usageLimit:
          data.usageLimit !== undefined &&
          data.usageLimit !== null &&
          data.usageLimit !== ""
            ? Number(data.usageLimit)
            : null,

        startsAt: data.startsAt ? new Date(data.startsAt) : null,

        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

        active: data.active ?? true,

        tenant: {
          connect: {
            id: tenant.id,
          },
        },

        ...(data.vendorId
          ? {
              vendor: {
                connect: {
                  id: data.vendorId,
                },
              },
            }
          : {}),
      },
    });

    // Return ONLY plain serializable values.
    return {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,

      type: coupon.type,

      value: Number(coupon.value),

      minimumAmount:
        coupon.minimumAmount !== null ? Number(coupon.minimumAmount) : null,

      usageLimit: coupon.usageLimit,

      usedCount: coupon.usedCount,

      startsAt: coupon.startsAt ? coupon.startsAt.toISOString() : null,

      expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString() : null,

      active: coupon.active,

      tenantId: coupon.tenantId,

      vendorId: coupon.vendorId,

      createdAt: coupon.createdAt.toISOString(),

      updatedAt: coupon.updatedAt.toISOString(),
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      throw new Error(
        `Coupon code "${code}" already exists. Please choose another code.`,
      );
    }

    throw error;
  }
}
