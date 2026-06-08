import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function GET() {
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
