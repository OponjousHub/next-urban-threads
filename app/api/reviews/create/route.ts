import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { updateProductRating } from "@/lib/calProduct-rating";
import NotificationService from "@/lib/notifications/notification.service";

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
        storeMode: tenant.storeMode,
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
        storeMode: tenant.storeMode,
        orderId: hasPurchased.id,
        verifiedPurchase: true,
        status: "APPROVED",
      },
    });

    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        name: true,
        vendorId: true,
      },
    });

    if (!product || !product.vendorId) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    });

    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "newReview",
      type: "REVIEW",
      title: "New Product Review",
      message: `${user?.name ?? "A customer"} left a review for "${product.name}".`,
      link: `/vendor/reviews`,
      metadata: {
        reviewId: review.id,
        productId: product.id,
      },
    });

    await NotificationService.notify({
      vendorId: review.id,
      setting: "newReview",
      type: "REVIEW",
      title: "New Review",
      message: `You received a new review (${review.id.slice(-8)}).`,
      link: `/vendor/orders/${review.id}`,
      metadata: {
        orderId: review.id,
      },
    });

    //Update product rating
    await updateProductRating(review.productId);

    // Recalculate product rating (ONLY approved reviews)
    const stats = await prisma.review.aggregate({
      where: {
        productId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
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
