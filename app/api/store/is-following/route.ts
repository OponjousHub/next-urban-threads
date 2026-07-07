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

    const tenantId = searchParams.get("tenantId");

    if (!tenantId) {
      return NextResponse.json(
        {
          message: "Tenant missing.",
        },
        {
          status: 400,
        },
      );
    }

    const follow = await prisma.storeFollow.findUnique({
      where: {
        userId_tenantId: {
          userId,
          tenantId,
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
