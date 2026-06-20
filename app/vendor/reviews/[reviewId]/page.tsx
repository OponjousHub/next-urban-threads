import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import ReviewDetail from "@/components/reviews/review-detail";

type Props = {
  params: Promise<{
    reviewId: string;
  }>;
};

export default async function VendorReviewPage({ params }: Props) {
  const { reviewId } = await params;

  const { vendor } = await getCurrentVendor();

  if (!vendor) notFound();

  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      product: {
        vendorId: vendor.id,
      },
    },
    include: {
      user: true,
      order: true,
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          thumbnail: true,
          price: true,
          averageRating: true,
        },
      },
    },
  });

  const moderationHistory = await prisma.reviewModerationHistory.findMany({
    where: {
      reviewId: reviewId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customerOrders = await prisma.order.findMany({
    where: {
      userId: review?.userId,
      vendorId: vendor.id,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalSpent = customerOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );

  const totalOrders = customerOrders.length;

  const firstPurchase =
    customerOrders.length > 0
      ? customerOrders[customerOrders.length - 1].createdAt
      : null;

  const lastPurchase =
    customerOrders.length > 0 ? customerOrders[0].createdAt : null;

  if (!review) {
    notFound();
  }

  const safeReview = JSON.parse(
    JSON.stringify(review, (_, value) =>
      typeof value === "object" &&
      value !== null &&
      value.constructor?.name === "Decimal"
        ? Number(value)
        : value,
    ),
  );

  //   const safeOrders = orders.map((order) => ({
  //   ...order,
  //   totalAmount: Number(order.totalAmount),
  // }));

  const customerPurchaseContext = {
    totalSpent,
    totalOrders,
    firstPurchase,
    lastPurchase,

    recentOrders: customerOrders.slice(0, 5).map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      totalAmount: Number(order.totalAmount),
      status: order.status,
      items: order.items.length,
    })),
  };

  return (
    <>
      <VendorHeaderUI
        title="Reviews"
        subtitle="Manage your store reviews"
        vendor={vendor}
      />
      <ReviewDetail
        review={safeReview}
        vendorId={vendor.id}
        moderationHistory={moderationHistory}
        customerContext={customerPurchaseContext}
      />
      ;
    </>
  );
}
