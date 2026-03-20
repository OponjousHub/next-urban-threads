// app/admin/products/[id]/page.tsx

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/admin/products/productDetails";

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const product = await prisma.product.findUnique({
    where: { id: params.id, tenantId: tenant.id },
  });

  if (!product) return notFound();

  // ✅ Convert Decimal
  const safeProduct = {
    ...product,
    price: Number(product.price),
  };

  return <ProductDetails product={safeProduct} />;
}
