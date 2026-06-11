import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ vendorId: string }> },
) {
  try {
    const { vendorId } = await params;

    const { adminNotes } = await req.json();

    const vendor = await prisma.vendor.update({
      where: {
        id: vendorId,
      },
      data: {
        adminNotes,
      },
    });

    return NextResponse.json({
      success: true,
      data: vendor,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to save notes",
      },
      {
        status: 500,
      },
    );
  }
}
