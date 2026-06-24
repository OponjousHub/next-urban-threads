import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
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

  const { active } = await req.json();

  const coupon = await prisma.coupon.update({
    where: {
      id: couponId,
      tenantId: tenant?.id,
    },

    data: {
      active,
    },
  });

  return NextResponse.json({
    success: true,
    coupon,
  });
}
