import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { updateProductRating } from "@/lib/calProduct-rating";
import NotificationService from "@/lib/notifications/notification.service";
import { AdminNotificationService } from "@/app/lib/admin/admin-notification-service";

export async function POST(req: Request) {
  try {
    const { rating, title, comment, productId } = await req.json();

    const { userId, tenant } = await getAuthPayload();

    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    if (!userId || !tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ---------------------------------------------------------
    // 2. Validate input
    // ---------------------------------------------------------

    if (!productId || typeof productId !== "string") {
      return NextResponse.json(
        { message: "Product is required" },
        { status: 400 },
      );
    }

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ message: "Invalid rating" }, { status: 400 });
    }

    if (!title?.trim()) {
      return NextResponse.json(
        { message: "Review title is required" },
        { status: 400 },
      );
    }

    if (!comment?.trim()) {
      return NextResponse.json(
        { message: "Review comment is required" },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 3. Verify that the product exists
    // ---------------------------------------------------------

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

    if (!product) {
      return NextResponse.json(
        { message: "Product not found." },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // 4. Prevent duplicate review
    //
    // The database @@unique([userId, productId]) is still
    // the final protection, but this gives the customer a
    // clean message instead of a P2002 error.
    // ---------------------------------------------------------

    const existingReview = await prisma.review.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      select: {
        id: true,
      },
    });

    if (existingReview) {
      return NextResponse.json(
        {
          message: "You have already reviewed this product.",
          reviewId: existingReview.id,
        },
        { status: 409 },
      );
    }

    // ---------------------------------------------------------
    // 5. Verify purchase
    // ---------------------------------------------------------

    const hasPurchased = await prisma.order.findFirst({
      where: {
        userId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        paymentStatus: "PAID",
        status: "DELIVERED",
        items: {
          some: {
            productId,
          },
        },
      },
      include: {
        user: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        {
          message: "Only customers who purchased this item can write a review",
        },
        { status: 403 },
      );
    }

    // ---------------------------------------------------------
    // 6. Create review
    // ---------------------------------------------------------

    const review = await prisma.review.create({
      data: {
        rating,
        title: title.trim(),
        comment: comment.trim(),
        userId,
        productId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        orderId: hasPurchased.id,
        verifiedPurchase: true,
        status: "APPROVED",
      },
    });

    // ---------------------------------------------------------
    // 7. Vendor notification
    //
    // In SINGLE_VENDOR mode, vendorId may legitimately be null.
    // The review itself should NOT fail because of that.
    // ---------------------------------------------------------

    if (product.vendorId) {
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
        link: `/vendor/reviews/${review.id}`,
        metadata: {
          reviewId: review.id,
          productId: product.id,
        },
      });
    }

    // ---------------------------------------------------------
    // 8. Admin notification
    // ---------------------------------------------------------

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
      },
    });

    await AdminNotificationService.notify({
      type: "NEW_REVIEW",
      title: "⭐ New Review",
      message: `${user?.name ?? "A customer"} left a review for ${product.name}.`,
      link: `/admin/reviews/${review.id}`,
      metadata: {
        reviewId: review.id,
        productId: product.id,
        productName: product.name,
        customerId: hasPurchased.user?.id,
        customerName: user?.name,
      },
    });

    // ---------------------------------------------------------
    // 9. Update product rating
    // ---------------------------------------------------------

    await updateProductRating(review.productId);

    // ---------------------------------------------------------
    // 10. Recalculate product rating/count
    // ---------------------------------------------------------

    const stats = await prisma.review.aggregate({
      where: {
        productId,
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        status: "APPROVED",
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        averageRating: stats._avg.rating ?? 0,
        reviewCount: stats._count,
      },
    });

    // ---------------------------------------------------------
    // 11. Success
    // ---------------------------------------------------------

    return NextResponse.json(
      {
        message: "Review submitted successfully",
        review,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("CREATE REVIEW ERROR:", error);

    // ---------------------------------------------------------
    // Handle race-condition duplicate
    //
    // Even though we check for an existing review above,
    // two simultaneous requests could still reach create().
    // The database constraint remains the final protection.
    // ---------------------------------------------------------

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return NextResponse.json(
        {
          message: "You have already reviewed this product.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        message: "Error creating review",
      },
      { status: 500 },
    );
  }
}
