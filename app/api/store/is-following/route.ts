import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const { userId } = await getAuthPayload();

    if (!userId) {
      return NextResponse.json({
        following: false,
      });
    }

    const { searchParams } = new URL(req.url);

    const vendorId = searchParams.get("vendorId");

    if (!vendorId) {
      return NextResponse.json(
        {
          message: "Vendor missing.",
        },
        {
          status: 400,
        },
      );
    }

    const follow = await prisma.storeFollow.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
        },
      },
    });

    return NextResponse.json({
      following: !!follow,
    });
  } catch {
    return NextResponse.json({
      following: false,
    });
  }
}
