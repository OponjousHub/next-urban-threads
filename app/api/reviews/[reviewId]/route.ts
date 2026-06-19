import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;
    const { status } = await req.json();

    const reviewStatus = await prisma.review.update({
      where: {
        id: reviewId,
      },
      data: {
        status,
      },
    });

    await prisma.reviewModerationHistory.create({
      data: {
        reviewId,
        action: "APPROVED",
      },
    });

    return NextResponse.json(reviewStatus);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> },
) {
  try {
    const { reviewId } = await params;

    await prisma.review.delete({
      where: {
        id: reviewId,
      },
    });

    await prisma.reviewModerationHistory.create({
      data: {
        reviewId,
        action: "DELETED",
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to delete review",
      },
      {
        status: 500,
      },
    );
  }
}
