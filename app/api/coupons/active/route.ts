import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json([], { status: 200 });
  }

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
    },
  });

  return NextResponse.json(coupons);
}
