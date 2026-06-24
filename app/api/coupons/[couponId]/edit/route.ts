import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      couponId: string;
    }>;
  },
) {
  const { couponId } = await params;
  const { tenant } = await getAuthPayload();

  const data = await req.json();
  console.log("UPDATED COUPON", data);
  const coupon = await prisma.coupon.update({
    where: {
      id: couponId,
      tenantId: tenant?.id,
    },

    data: {
      code: data.code,

      description: data.description,

      type: data.type,

      value: Number(data.value),

      minimumAmount: data.minimumOrderAmount
        ? Number(data.minimumOrderAmount)
        : null,

      usageLimit: data.usageLimit ? Number(data.usageLimit) : null,

      startsAt: data.startsAt ? new Date(data.startsAt) : null,

      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,

      active: data.active,
    },
  });

  return NextResponse.json(coupon);
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      couponId: string;
    }>;
  },
) {
  const { couponId } = await params;
  const { tenant } = await getAuthPayload();

  await prisma.coupon.delete({
    where: {
      id: couponId,
      tenantId: tenant?.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
