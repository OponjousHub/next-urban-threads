import VendorHeaderUI from "@/components/vendor/vendorHeader";
import Header from "@/components/admin/products/header";
import ProductsTable from "@/components/products/product-table";
import Pagination from "@/components/products/product-pagination";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

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
      <Header />
      {query && (
        <p className="text-sm text-gray-600">
          Showing results for{" "}
          <span className="font-medium text-black">"{query}"</span>
        </p>
      )}
      <ProductsTable products={safeProducts} query={query} />
      <Pagination totalPages={totalPages} />
    </div>
  );
}
