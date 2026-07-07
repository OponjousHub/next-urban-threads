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
      slug,
    },

    include: {
      products: {
        where: {
          instock: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        include: {
          reviews: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  // Count the followers
  const followerCount = await prisma.storeFollow.count({
    where: {
      tenantId: vendor.tenantId,
    },
  });

  const allReviews = vendor.products.flatMap((product) => product.reviews);

  const totalReviews = allReviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : allReviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

  const safeVendor = {
    ...vendor,

    products: new Array(vendor.products.length),

    createdAt: vendor.createdAt.toISOString(),
  };

  return (
    <>
      {/* FULL-WIDTH HERO */}
      <VendorHero
        vendor={safeVendor}
        averageRating={averageRating}
        totalReviews={totalReviews}
        followerCount={followerCount}
      />

      {/* PAGE CONTENT */}
      <main className="mx-auto max-w-7xl px-6 pb-16">
        {/* Products */}

        {/* Tabs */}

        {/* About */}

        {/* Reviews */}
      </main>
    </>
  );
}
