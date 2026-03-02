import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function PATCH(req: Request) {
  const { rating, comment, reviewId } = await req.json();

  const { userId } = await getAuthPayload();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const review = await prisma.review.update({
    where: {
      id: reviewId,
      userId, // prevents editing others' reviews
    },
    data: {
      rating,
      comment,
      status: "PENDING", // optional: re-moderate on edit
    },
  });

  return NextResponse.json(review);
}
