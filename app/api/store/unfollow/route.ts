import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function DELETE(req: Request) {
  try {
    const { userId } = await getAuthPayload();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { tenantId } = await req.json();

    await prisma.storeFollow.deleteMany({
      where: {
        tenantId,
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
