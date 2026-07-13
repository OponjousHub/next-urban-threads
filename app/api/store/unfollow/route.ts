import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function DELETE(req: Request) {
  try {
    const { userId } = await getAuthPayload();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { vendorId } = await req.json();

    if (!vendorId) {
      return NextResponse.json(
        { message: "Vendor ID is required." },
        { status: 400 },
      );
    }

    await prisma.storeFollow.deleteMany({
      where: {
        vendorId,
        userId,
      },
    });

    return NextResponse.json({
      following: false,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to unfollow store.",
      },
      {
        status: 500,
      },
    );
  }
}
