import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const auth = await getAuthPayload();

    if (!auth?.userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { rejectionReason } = await req.json();

    const { id } = await params;

    await prisma.vendorApplication.update({
      where: {
        id,
      },
      data: {
        status: "REJECTED",
        rejectionReason,
        reviewedAt: new Date(),
        reviewedBy: auth.userId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ message: "Rejection failed" }, { status: 500 });
  }
}
