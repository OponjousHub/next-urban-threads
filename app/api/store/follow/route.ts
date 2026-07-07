import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { user } = await getAuthPayload();

    if (!user) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 },
      );
    }

    const { tenantId } = await req.json();

    if (!tenantId) {
      return NextResponse.json(
        { message: "Tenant ID is required." },
        { status: 400 },
      );
    }

    const existing = await prisma.storeFollow.findUnique({
      where: {
        userId_tenantId: {
          userId: user.id,
          tenantId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({
        following: true,
      });
    }

    await prisma.storeFollow.create({
      data: {
        userId: user.id,
        tenantId,
      },
    });

    return NextResponse.json({
      following: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to follow store.",
      },
      {
        status: 500,
      },
    );
  }
}
