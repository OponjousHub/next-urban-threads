import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json("Unauthorized!");
  }

  try {
    const auth = await getAuthPayload();

    if (!auth || auth.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        tenantId: tenant.id,
      },
      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },

        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: vendors,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch vendors",
      },
      {
        status: 500,
      },
    );
  }
}
