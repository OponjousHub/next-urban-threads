import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { logo, banner, accentColor } = await req.json();

    const vendor = await prisma.vendor.findFirst({
      where: {
        users: {
          some: {
            id: userId,
          },
        },
      },
      select: {
        id: true,
      },
    });

    if (!vendor) {
      return NextResponse.json(
        { message: "Vendor not found." },
        { status: 404 },
      );
    }

    await prisma.vendor.update({
      where: {
        id: vendor.id,
      },
      data: {
        logo,
        banner,
        accentColor,
      },
    });

    return NextResponse.json({
      message: "Appearance updated successfully.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Unable to update appearance.",
      },
      {
        status: 500,
      },
    );
  }
}
