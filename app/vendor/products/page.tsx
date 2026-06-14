import VendorHeaderUI from "@/components/vendor/vendorHeader";
import ProductsTable from "@/components/products/product-table";
import Pagination from "@/components/products/product-pagination";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import ProductSearch from "@/components/products/product-search";
import ProductSorting from "@/components/products/product-sorting";
import { ProductFilters } from "@/components/products/product-filters";
import Link from "next/link";

export default async function VendorProductsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    category?: string;
    stock?: string;
    featured?: string;
    sort?: string;
    page?: string;
  };
}) {
  const { vendor } = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const queryParams = await searchParams;
  const query = queryParams.q || "";
  const category = queryParams.category;
  const { q, stock, featured, sort } = queryParams;

  // Building orderBy for sorting
  let orderBy: any = { createdAt: "desc" };

  if (sort === "price_asc") orderBy = { price: "asc" };
  if (sort === "price_desc") orderBy = { price: "desc" };
  if (sort === "stock") orderBy = { stock: "asc" };
  if (sort === "newest") orderBy = { createdAt: "desc" };

  // PAGINATION
  const page = Number(queryParams.page) || 1;
  const pageSize = 10;

  const skip = (page - 1) * pageSize;

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,
      tenantId: tenant.id,
      vendorId: vendor.id,
      storeMode: tenant.storeMode,

      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),

      ...(category && {
        category: {
          slug: category.toLowerCase(),
        },
      }),

      ...(featured && { featured: featured === "true" }),

      ...(stock === "low" && { stock: { lte: 5 } }),
      ...(stock === "out" && { stock: 0 }),
    },
    orderBy,
    skip,
    take: pageSize,
  });

  //Get Total count for to get the number of pages
  const totalProducts = await prisma.product.count({
    where: {
      deletedAt: null,
      tenantId: tenant.id,
      vendorId: vendor.id,
      storeMode: tenant.storeMode,

      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),

      ...(category && {
        category: {
          slug: category.toLowerCase(),
        },
      }),
      ...(featured && { featured: featured === "true" }),
      ...(stock === "low" && { stock: { lte: 5 } }),
      ...(stock === "out" && { stock: 0 }),
    },
  });

  const totalPages = Math.ceil(totalProducts / pageSize);

  const safeProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  //   const res = await fetch("http://localhost:3000/api/products", {
  //     cache: "no-store",
  //   });

  return (
    <div className="space-y-6 sticky top-0 z-30">
      <VendorHeaderUI
        title="Products"
        subtitle="Manage your store products"
        vendor={vendor}
      />
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3">
        <div className="flex flex-col gap-3">
          {/* Row 1: Search (mobile) | Search + Filters (md) | Part of single row (lg) */}
          <div className="flex flex-col gap-3 lg:hidden">
            {/* Search */}
            <div className="w-full lg:flex-1">
              <ProductSearch basePath="/vendor/products" />
            </div>

            {/* Filters */}
            <div className="w-full md:w-auto lg:shrink-0">
              <ProductFilters basePath="/vendor/products" />
            </div>
          </div>

          {/* Row 2: Sort + Add (mobile/md) | Part of single row (lg) */}
          <div className="flex items-end justify-between gap-3 lg:contents">
            {/* Sort */}
            <div className="flex flex-col text-xs text-gray-500 shrink-0 lg:hidden">
              <span>Sort</span>
              <ProductSorting />
            </div>

            {/* Add Button */}
            <div className="shrink-0 lg:ml-auto">
              <Link href="/vendor/products/new">
                <button className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 whitespace-nowrap">
                  <span className="text-lg leading-none">+</span>
                  <span>Add Product</span>
                </button>
              </Link>
            </div>
          </div>

          {/* Desktop layout override */}
          <div className="hidden lg:flex lg:items-end lg:gap-4 lg:absolute lg:inset-0 lg:px-4 lg:py-3">
            <div className="flex-1">
              <ProductSearch basePath="/vendor/products" />
            </div>

            <ProductFilters basePath="/vendor/products" />

            <div className="flex flex-col text-xs text-gray-500">
              <span>Sort</span>
              <ProductSorting />
            </div>

            <div className="ml-auto">
              <Link href="/vendor/products/new">
                <button className="flex items-center justify-center gap-2 bg-black text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg hover:opacity-90 transition-all duration-200 whitespace-nowrap">
                  <span className="text-lg leading-none">+</span>
                  <span>Add Product</span>
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
      {query && (
        <p className="text-sm text-gray-600">
          Showing results for{" "}
          <span className="font-medium text-black">"{query}"</span>
        </p>
      )}

      <ProductsTable products={safeProducts} query={query} basePath="/vendor/products" />
      <Pagination totalPages={totalPages} />
    </div>
  );
}
