import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import VendorHero from "@/components/storefront/vendor-hero";
import VendorStoreContent from "@/components/store/vendor-store-content";
import SimilarStoresSection from "@/components/store/similar-stores-section";

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
          reviews: {
            include: {
              user: {
                select: {
                  name: true,
                  avatarUrl: true, // or avatar if that's your field
                },
              },
            },
          },
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

  // Load Similar vendor
  const similarVendors = await prisma.vendor.findMany({
    where: {
      id: {
        not: vendor.id,
      },
      products: {
        some: {},
      },
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },

      products: {
        select: {
          averageRating: true,
        },
      },
    },

    take: 4,
  });

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

  // Count the followers for Similar vendor links
  const similarVendorFollowers = await prisma.storeFollow.groupBy({
    by: ["tenantId"],

    _count: {
      tenantId: true,
    },

    where: {
      tenantId: {
        in: similarVendors.map((v) => v.tenantId),
      },
    },
  });

  if (!similarVendorFollowers) {
    notFound();
  }

  // const allReviews = vendor.products.flatMap((product) => product.reviews);

  const totalReviews = allReviews.length;

  const averageRating =
    totalReviews === 0
      ? 0
      : allReviews.reduce((sum, review) => sum + review.rating, 0) /
        totalReviews;

  // Latest reviews: Sort by newest and keep only the latest six:
  const latestReviews = [...allReviews]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .slice(0, 6);

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

  const safeLatestReviews = latestReviews.map((review) => ({
    ...review,
    createdAt: review.createdAt.toISOString(),

    user: {
      name: review.user?.name ?? "Anonymous",
      avatar: review.user?.avatarUrl ?? null,
    },
  }));

  const safeSimilarVendors = similarVendors.map((store) => {
    const ratings = store.products
      .map((p) => p.averageRating ?? 0)
      .filter((r) => r > 0);

    const averageRating =
      ratings.length === 0
        ? 0
        : ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const followerCount =
      similarVendorFollowers.find((f) => f.tenantId === store.tenantId)?._count
        .tenantId ?? 0;

    return {
      id: store.id,
      slug: store.slug,
      name: store.name,
      logo: store.logo,
      banner: store.banner,
      averageRating,
      productCount: store._count.products,
      followerCount,
    };
  });
  //   const ratings = store.products
  //     .map((p) => p.averageRating ?? 0)
  //     .filter((r) => r > 0);

  //   const averageRating =
  //     ratings.length === 0
  //       ? 0
  //       : ratings.reduce((a, b) => a + b, 0) / ratings.length;

  //   return {
  //     id: store.id,
  //     slug: store.slug,
  //     name: store.name,
  //     logo: store.logo,
  //     banner: store.banner,
  //     averageRating,
  //     productCount: store._count.products,
  //     followerCount: store._count.followers,
  //   };
  // });

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
        <VendorStoreContent
          vendor={safeVendor}
          averageRating={averageRating}
          totalReviews={totalReviews}
          followers={followerCount}
          reviews={safeLatestReviews}
          rating1={rating1}
          rating2={rating2}
          rating3={rating3}
          rating4={rating4}
          rating5={rating5}
        />
        <SimilarStoresSection stores={safeSimilarVendors} />
      </main>
    </>
  );
}
