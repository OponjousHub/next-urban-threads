import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/products/productDetails";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const tenant = await getDefaultTenant();
  const param = await params;
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: param.id,
      tenantId: tenant.id,
      storeMode: tenant.storeMode,
    },
  });

  if (!product) return notFound();

  // ✅ Convert Decimal
  const safeProduct = {
    ...product,
    price: Number(product.price),
  };

  return <ProductDetails product={safeProduct} basePath={"/vendor/products"} />;
}
