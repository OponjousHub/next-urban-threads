import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;

    const { reply } = await req.json();

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        reply,
        repliedAt: new Date(),
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to save reply",
      },
      {
        status: 500,
      },
    );
  }
}
