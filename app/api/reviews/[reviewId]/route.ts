import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function PATCH(req: Request) {
  const { status, reviewId } = await req.json();

  const reviewStatus = await prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      status,
    },
  });

  NextResponse.json({
    data: reviewStatus,
  });
}
