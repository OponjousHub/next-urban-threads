import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
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

  return <ReviewDetail review={safeReview} vendorId={vendor.id} />;
}
