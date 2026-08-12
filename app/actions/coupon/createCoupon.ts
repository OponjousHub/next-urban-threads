"use server";

import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

type CreateCouponInput = {
  vendorId?: string;
  code: string;
  description?: string;
  type: "PERCENTAGE" | "FIXED";
  value: string | number;
  minimumOrderAmount?: string | number;
  usageLimit?: string | number;
  startsAt?: string;
  expiresAt?: string;
  active?: boolean;
};

export async function createCoupon(data: CreateCouponInput) {
  const { tenant } = await getAuthPayload();

  if (!tenant?.id) {
    throw new Error("Tenant not found");
  }

  const code = data.code.trim().toUpperCase();

  if (!code) {
    throw new Error("Coupon code is required");
  }

  const value = Number(data.value);

  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Discount value must be greater than zero");
  }

  if (data.type === "PERCENTAGE" && value > 100) {
    throw new Error("Percentage discount cannot exceed 100%");
  }

  const existingCoupon = await prisma.coupon.findFirst({
    where: {
      tenantId: tenant.id,
      code,
    },
  });

  if (existingCoupon) {
    throw new Error(`Coupon "${code}" already exists`);
  }

  const minimumAmount =
    data.minimumOrderAmount !== undefined && data.minimumOrderAmount !== ""
      ? Number(data.minimumOrderAmount)
      : null;

  const usageLimit =
    data.usageLimit !== undefined && data.usageLimit !== ""
      ? Number(data.usageLimit)
      : null;

  if (minimumAmount !== null && minimumAmount < 0) {
    throw new Error("Minimum order amount cannot be negative");
  }

  if (
    usageLimit !== null &&
    (!Number.isInteger(usageLimit) || usageLimit <= 0)
  ) {
    throw new Error("Usage limit must be a positive whole number");
  }

  // ---------------------------------------------------------
  // Vendor scope
  //
  // vendorId present:
  //   Vendor-specific coupon (MULTI_VENDOR)
  //
  // vendorId absent:
  //   Store-wide coupon (SINGLE_VENDOR / admin)
  // ---------------------------------------------------------

  const couponData: any = {
    code,
    description: data.description?.trim() || null,
    type: data.type,
    value,
    tenant: {
      connect: {
        id: tenant.id,
      },
    },
    minimumAmount,
    usageLimit,
    startsAt: data.startsAt ? new Date(data.startsAt) : null,
    expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
    active: data.active ?? true,
  };

  if (data.vendorId) {
    couponData.vendor = {
      connect: {
        id: data.vendorId,
      },
    };
  }

  return prisma.coupon.create({
    data: couponData,
  });
}
