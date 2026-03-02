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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify purchase
    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        tenantId: tenant.id,
        paymentStatus: "PAID",
        status: "DELIVERED",
        items: {
          some: { productId },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { message: "Only customers who purchased this item can write review" },
        { status: 403 },
      );
    }

    // Create review (default PENDING if moderation enabled)
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId,
        productId,
        tenantId: tenant.id,
        orderId: hasPurchased.id,
        verifiedPurchase: true,
        status: "APPROVED", // or PENDING depending on tenant policy
      },
    });

    // Recalculate product rating (ONLY approved reviews)
    const stats = await prisma.review.aggregate({
      where: {
        productId,
        tenantId: tenant.id,
        status: "APPROVED",
      },
      _avg: { rating: true },
      _count: true,
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });

    return NextResponse.json(review);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error creating review" },
      { status: 500 },
    );
  }
}
