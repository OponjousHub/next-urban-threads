import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { notFound } from "next/navigation";
import ProductDetails from "@/components/products/productDetails";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const param = await params;
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const product = await prisma.product.findFirst({
    where: {
      id: param.id,
      tenantId: tenant.id,
      storeMode: tenant.storeMode,
    },
    include: {
      variants: true,
    },
  });

  if (!product) return notFound();

  // ✅ Convert Decimal
  const safeProduct = {
    ...product,
    price: Number(product.price),
  };

  return (
    <>
      <AdminHeaderUI title="Product " subtitle="View product details" />
      <ProductDetails product={safeProduct} basePath="/admin/products" />
    </>
  );
}
