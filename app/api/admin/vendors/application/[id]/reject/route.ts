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

    const { id } = await params;

    const application = await prisma.vendorApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { message: "Application not found" },
        { status: 404 },
      );
    }

    if (application.status !== "PENDING") {
      return NextResponse.json(
        {
          message: "Only pending applications can be rejected",
        },
        { status: 400 },
      );
    }

    const { rejectionReason } = await req.json();

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
