import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  try {
    const { vendorId } = await params;

    const vendor = await prisma.vendor.findUnique({
      where: {
        id: vendorId,
      },

      include: {
        users: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            role: true,
          },
        },

        _count: {
          select: {
            products: true,
            orders: true,
          },
        },
      },
    });

    if (!vendor) {
      return NextResponse.json(
        {
          message: "Vendor not found",
        },
        {
          status: 404,
        },
      );
    }

    const latestApplication = await prisma.vendorApplication.findFirst({
      where: {
        userId: vendor.users[0]?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: vendor,
      application: latestApplication,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to fetch vendor",
      },
      {
        status: 500,
      },
    );
  }
}
