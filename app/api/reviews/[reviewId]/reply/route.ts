import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;

    const { reply } = await req.json();

    if (!reply) {
      return NextResponse.json(
        {
          message: "The reply field is empty. Please write a reply.",
        },
        { status: 400 },
      );
    }

    const review = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        reply,
        repliedAt: new Date(),
      },
    });

    await prisma.reviewModerationHistory.create({
      data: {
        reviewId,
        action: "REPLIED",
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
