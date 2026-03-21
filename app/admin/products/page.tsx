import Header from "@/components/admin/products/header";
import ProductsTable from "@/components/admin/products/product-table";
import { prisma } from "@/utils/prisma";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";

  const products = await prisma.product.findMany({
    where: {
      deletedAt: null, // if using soft delete
      ...(query && {
        OR: [
          {
            name: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      }),
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
    <div className="space-y-6">
      <Header />
      <ProductsTable
        // products={data.products || []}
        products={safeProducts}
      />
    </div>
  );
}
