import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";

import VendorHero from "@/components/storefront/vendor-hero";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function VendorStorePage({ params }: Props) {
  const { slug } = await params;

  const vendor = await prisma.vendor.findUnique({
    where: {
      storeSlug: slug,
    },

    include: {
      products: {
        where: {
          status: "PUBLISHED",
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      reviews: true,
    },
  });

  if (!vendor) {
    notFound();
  }

  const totalReviews = vendor.reviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : vendor.reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews;

  return (
    <main className="mx-auto max-w-7xl px-6 py-8">
      <VendorHero
        vendor={vendor}
        averageRating={averageRating}
        totalReviews={totalReviews}
      />
    </main>
  );
}
