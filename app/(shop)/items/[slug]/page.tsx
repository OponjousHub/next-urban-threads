import { prisma } from "@/utils/prisma";
import { ReviewForm } from "@/components/reviews/reviewForm";
import { ReviewList } from "@/components/reviews/reviewList";
import { RatingSummary } from "@/components/reviews/ratingSummary";
import { notFound, unauthorized } from "next/navigation";
import { getTenant } from "@/lib/tenant/getTenant";

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = params;
  const tenant = await getTenant();

  if (!tenant) {
    throw new Error("Unauthorized");
  }

  // 1️⃣ Get product
  const product = await prisma.product.findUnique({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug,
      },
    },
  });

  if (!product) return notFound();

  // 2️⃣ Fetch approved reviews
  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      tenantId: product.tenantId,
      status: "APPROVED",
    },
    include: {
      user: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-10">
      {/* Rating summary */}
      <RatingSummary
        average={product.averageRating}
        count={product.reviewCount}
      />

      {/* Review form (client component) */}
      <ReviewForm productId={product.id} />

      {/* Review list */}
      <ReviewList reviews={reviews} />
    </div>
  );
}
