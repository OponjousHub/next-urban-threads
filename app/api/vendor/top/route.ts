import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    const vendors = await prisma.vendor.findMany({
      where: {
        tenantId: tenant.id,
        status: "APPROVED", // remove if you don't have this field
      },
      include: {
        _count: {
          select: {
            products: true,
            storeFollow: true,
          },
        },
      },
      orderBy: {
        storeFollow: {
          _count: "desc",
        },
      },
      take: 4,
    });

    return NextResponse.json(vendors);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to load vendors.",
      },
      {
        status: 500,
      },
    );
  }
}
