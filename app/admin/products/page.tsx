import Header from "@/components/admin/products/header";
import ProductsTable from "@/components/admin/products/product-table";
import { prisma } from "@/utils/prisma";
import { Category } from "@prisma/client";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: {
    q?: string;
    category?: string;
    stock?: string;
    featured?: string;
  };
}) {
  const query = searchParams.q || "";
  const categoryEnum = searchParams.category
    ? (Category[
        searchParams.category.toUpperCase() as keyof typeof Category
      ] as Category)
    : undefined;
  const { q, category, stock, featured } = searchParams;

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null,

      ...(q && {
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
        ],
      }),

      ...(categoryEnum && { category: categoryEnum }),

      ...(featured && { featured: featured === "true" }),

      ...(stock === "low" && { stock: { lte: 5 } }),
      ...(stock === "out" && { stock: 0 }),
    },
    orderBy: { createdAt: "desc" },
  });

  const safeProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  const res = await fetch("http://localhost:3000/api/products", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="space-y-6 sticky top-0 z-30">
      <Header />
      {query && (
        <p className="text-sm text-gray-600">
          Showing results for{" "}
          <span className="font-medium text-black">"{query}"</span>
        </p>
      )}
      <ProductsTable products={safeProducts} query={query} />
    </div>
  );
}
