import { prisma } from "@/utils/prisma";
import { ReviewForm } from "@/components/reviews/reviewForm";
import { ReviewList } from "@/components/reviews/reviewList";
import { RatingSummary } from "@/components/reviews/ratingSummary";
import { notFound } from "next/navigation";
import { getTenant } from "@/lib/tenant/getTenant";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const tenant = await getTenant();

  if (!tenant) {
    throw new Error("Unauthorized");
  }

  // 1. Get product belonging to the current tenant
  const product = await prisma.product.findUnique({
    where: {
      tenantId_slug: {
        tenantId: tenant.id,
        slug,
      },
    },
  });

  if (!product) {
    notFound();
  }

  // 2. Fetch approved reviews
  const reviews = await prisma.review.findMany({
    where: {
      productId: product.id,
      tenantId: product.tenantId,
      status: "APPROVED",
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-10">
      {/* Rating summary */}
      <RatingSummary
        average={product.averageRating}
        count={product.reviewCount}
      />

      {/* Review form */}
      <ReviewForm productId={product.id} />

      {/* Review list */}
      <ReviewList reviews={reviews} />
    </div>
  );
}
