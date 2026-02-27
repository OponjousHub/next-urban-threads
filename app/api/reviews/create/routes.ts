import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { rating, comment, productId } = await req.json();
    const { userId, tenant } = await getAuthPayload();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid rating" }, { status: 400 });
    }
    if (!userId || !tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 400 });
    }

    // TO VERIFY PURCHASE
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        tenantId: tenant.id,
        items: {
          some: {
            productId,
          },
        },
        paymentStatus: "PAID",
        status: "DELIVERED",
      },
    });

    // REJECT REVIEW CREATION
    if (!hasPurchased) {
      return NextResponse.json(
        { message: "Only customers who purchased this item can write review" },
        { status: 400 },
      );
    }

    // CREATE REVIEW
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
        tenantId: tenant.id,
      },
    });

    // Recalculate product rating
    const stats = await prisma.review.aggregate({
      where: { productId, tenantId: tenant.id, userId },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.product.update({
      where: { id: productId, tenantId: tenant.id },
      data: {
        averageRating: stats._avg.rating || 0,
        reviewCount: stats._count,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    return NextResponse.json(
      { message: "Error creating review" },
      { status: 500 },
    );
  }
}
