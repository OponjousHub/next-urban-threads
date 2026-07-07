import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/app/lib/auth";

export async function GET(req: Request) {
  try {
    const { user } = await getAuthPayload();

    if (!user) {
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
          userId: user.id,
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
