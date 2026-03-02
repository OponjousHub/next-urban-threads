import { ProductDetailUI } from "@/components/productDetailsUI";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/products/productDetailSkeleton";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

async function getProduct(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}`,
    { cache: "no-store" },
  );

  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to fetch product");

  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const product = await getProduct(productId);

  if (!product) notFound();

  const reviews = await prisma.review.findMany({
    where: {
      productId,
      status: "APPROVED",
    },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  let canReview = false;
  let userReview = null;

  try {
    const { userId, tenant } = await getAuthPayload();

    if (userId && tenant?.id) {
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

      userReview = await prisma.review.findFirst({
        where: {
          userId,
          tenantId: tenant.id,
          productId,
        },
      });

      const alreadyReviewed = await prisma.review.findFirst({
        where: { userId, productId },
      });

      canReview = !!hasPurchased && !alreadyReviewed;
    }
  } catch (err) {
    console.error(err);
  }
  console.log("........>>>>>>>>>>>>>", userReview);
  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailUI
        product={product}
        reviews={reviews}
        canReview={canReview}
        userReview={userReview}
      />
    </Suspense>
  );
}
