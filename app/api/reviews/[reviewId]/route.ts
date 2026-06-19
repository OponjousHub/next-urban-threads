import { NextResponse } from "next/server";
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

    return NextResponse.json(reviewStatus);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Failed to update review" },
      { status: 500 },
    );
  }
}
