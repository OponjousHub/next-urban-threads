import { prisma } from "@/utils/prisma";
import StoreCard from "@/components/store/store-card";

export default async function StoresPage() {
  const vendors = await prisma.vendor.findMany({
    where: {
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

    orderBy: {
      name: "asc",
    },
  });

  const followerCounts = await prisma.storeFollow.groupBy({
    by: ["vendorId"],

    _count: {
      vendorId: true,
    },
  });

  const stores = vendors.map((vendor) => {
    const ratings = vendor.products
      .map((p) => p.averageRating ?? 0)
      .filter((r) => r > 0);

    const averageRating =
      ratings.length === 0
        ? 0
        : ratings.reduce((a, b) => a + b, 0) / ratings.length;

    const followers =
      followerCounts.find((f) => f.vendorId === vendor.id)?._count.vendorId ??
      0;

    return {
      id: vendor.id,
      slug: vendor.slug,
      name: vendor.name,
      logo: vendor.logo,
      banner: vendor.banner,
      rating: averageRating,
      products: vendor._count.products,
      followers,
    };
  });

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-12">
        <h1 className="text-4xl font-bold">Browse Stores</h1>

        <p className="mt-3 text-gray-500">
          Discover trusted vendors on Urban Threads.
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
        {stores.map((store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
    </main>
  );
}
