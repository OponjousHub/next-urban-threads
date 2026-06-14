import ProductSearch from "@/components/products/product-search";
import { ProductFilters } from "@/components/products/product-filters";
import ProductSorting from "@/components/products/product-sorting";
import Pagination from "@/components/products/product-pagination";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import Link from "next/link";
import ProductsTable from "@/components/products/product-table";

export default async function ProductsPage({
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

  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  return (
    <div className="space-y-6 sticky top-0 z-30">
      <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 space-y-4">
        {/* Top row */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl lg:text-2xl font-semibold">Products</h1>
            <p className="hidden lg:block text-sm text-gray-500">
              Manage your inventory and product listings
            </p>
          </div>

          <Link href={`/admin/products/new`}>
            <button className="bg-black text-white px-3 py-2 lg:px-4 rounded-lg text-sm hover:opacity-90">
              + Add
            </button>
          </Link>
        </div>

        {/* Search row */}
        <div className="w-full">
          <ProductSearch basePath="/admin/products" />
        </div>

        {/* Filters + Sort */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          <ProductFilters basePath="/admin/products" />
          <div className="flex flex-col text-xs text-gray-500">
            <span>Sort</span>
            <ProductSorting />
          </div>
        </div>
      </div>
      {query && (
        <p className="text-sm text-gray-600">
          Showing results for{" "}
          <span className="font-medium text-black">"{query}"</span>
        </p>
      )}
      <ProductsTable
        products={safeProducts}
        query={query}
        basePath="/admin/products"
      />
      <Pagination totalPages={totalPages} />
    </div>
  );
}
