import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import VendorProductsSection from "@/components/store/vendor-products-section";
import VendorHero from "@/components/storefront/vendor-hero";
import VendorAboutSection from "@/components/store/vendor-about-section";

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
          category: true,
          reviews: true,
        },
      },
    },
  });

  if (!vendor) {
    notFound();
  }

  // Compute review infor
  const allReviews = vendor.products.flatMap((product) =>
    product.reviews.map((review) => ({
      ...review,
      product: {
        name: product.name,
      },
    })),
  );

  //Computing rating counts
  const rating5 = allReviews.filter((r) => r.rating === 5).length;
  const rating4 = allReviews.filter((r) => r.rating === 4).length;
  const rating3 = allReviews.filter((r) => r.rating === 3).length;
  const rating2 = allReviews.filter((r) => r.rating === 2).length;
  const rating1 = allReviews.filter((r) => r.rating === 1).length;

  // Count the followers
  const followerCount = await prisma.storeFollow.count({
    where: {
      tenantId: vendor.tenantId,
    },
  });

  // const allReviews = vendor.products.flatMap((product) => product.reviews);

  const totalReviews = allReviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : allReviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

  const safeVendor = {
    ...vendor,

    createdAt: vendor.createdAt.toISOString(),

    products: vendor.products.map((product) => ({
      ...product,

      price: Number(product.price),
      discountedPrice: product.discountedPrice
        ? Number(product.discountedPrice)
        : null,

      videos: Array.isArray(product.videos)
        ? (product.videos as {
            url: string;
            public_id: string;
          }[])
        : [],

      createdAt: product.createdAt.toISOString(),

      updatedAt: product.updatedAt.toISOString(),
    })),
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
        <VendorProductsSection products={safeVendor.products} />

        {/* Tabs */}

        {/* About */}
        <VendorAboutSection
          vendor={safeVendor}
          averageRating={averageRating}
          totalReviews={totalReviews}
          followers={followerCount}
        />

        {/* Reviews */}
      </main>
    </>
  );
}
