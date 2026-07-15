import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

import VendorStats from "./vendor-stats";
import VendorSearch from "./vendor-search";
import VendorSort from "./vendor-sort";
import VendorGrid from "./vendor-grid";
import EmptyState from "./empty-state";

type Props = {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function StoresPage({ searchParams }: Props) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found.");
  }

  const params = await searchParams;

  const search = params.search ?? "";
  const sort = params.sort ?? "followers";
  const page = Number(params.page ?? "1");

  const take = 12;
  const skip = (page - 1) * take;

  const where = {
    tenantId: tenant.id,

    ...(search && {
      storeName: {
        contains: search,
        mode: "insensitive" as const,
      },
    }),
  };

  const orderBy =
    sort === "products"
      ? {
          products: {
            _count: "desc" as const,
          },
        }
      : sort === "newest"
        ? {
            createdAt: "desc" as const,
          }
        : {
            followers: {
              _count: "desc" as const,
            },
          };

  const [vendors, totalVendors] = await Promise.all([
    prisma.vendor.findMany({
      where,
      orderBy,

      include: {
        _count: {
          select: {
            products: true,
            followers: true,
          },
        },
      },

      skip,
      take,
    }),

    prisma.vendor.count({
      where,
    }),

    // Stats
  ]);

  const [totalProducts, totalFollowers] = await Promise.all([
    prisma.product.count({
      where: {
        tenantId: tenant.id,
      },
    }),

    prisma.storeFollow.count(),
  ]);

  const totalPages = Math.ceil(totalVendors / take);

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Hero */}
      <div className="mb-12 text-center">
        <p className="mb-2 text-sm uppercase tracking-[0.25em] text-gray-500">
          Discover
        </p>

        <h1 className="text-4xl font-bold">Browse Amazing Stores</h1>

        <p className="mx-auto mt-4 max-w-2xl text-gray-600">
          Explore trusted stores, discover unique products, follow your
          favourite vendors and shop with confidence.
        </p>
      </div>

      <VendorStats
        totalStores={totalVendors}
        totalProducts={totalProducts}
        totalFollowers={totalFollowers}
      />

      <div className="mt-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <VendorSearch defaultValue={search} />

        <VendorSort currentSort={sort} />
      </div>

      {vendors.length === 0 ? <EmptyState /> : <VendorGrid vendors={vendors} />}

      {totalPages > 1 && (
        <div className="mt-12 flex justify-center gap-2">
          {Array.from({ length: totalPages }).map((_, index) => {
            const current = index + 1;

            const url = new URLSearchParams();

            if (search) url.set("search", search);

            if (sort) url.set("sort", sort);

            url.set("page", current.toString());

            return (
              <a
                key={current}
                href={`/vendor/stores?${url.toString()}`}
                className={`rounded-lg px-4 py-2 transition
                  ${
                    current === page
                      ? "bg-[var(--color-primary)] text-white"
                      : "border hover:bg-gray-50"
                  }`}
              >
                {current}
              </a>
            );
          })}
        </div>
      )}
    </main>
  );
}
