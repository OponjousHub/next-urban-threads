"use server";

import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function createCoupon(data: any) {
  const { tenant } = await getAuthPayload();

  return prisma.coupon.create({
    data: {
      vendorId: data.vendorId,

      code: data.code,

      description: data.description,

      type: data.type,

      value: Number(data.value),
      tenant: {
        connect: {
          id: tenant?.id,
        },
      },

      minimumAmount: data.minimumOrderAmount
        ? Number(data.minimumOrderAmount)
        : null,

      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,

      startsAt: data.startsAt ? new Date(data.startsAt) : null,

      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

      active: data.active,
    },
  });
}
