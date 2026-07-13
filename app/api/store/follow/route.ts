import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { userId } = await getAuthPayload();

    if (!userId) {
      return NextResponse.json(
        { message: "Please login first." },
        { status: 401 },
      );
    }

    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { message: "Vendor ID is required." },
        { status: 400 },
      );
    }

    const existing = await prisma.storeFollow.findUnique({
      where: {
        userId_vendorId: {
          userId,
          vendorId,
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
        userId,
        vendorId,
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
