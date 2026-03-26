import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { ProductForm } from "@/components/admin/products/productForm";

export default async function EditProductPage({
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

  const productData = {
    ...product,
    price: Number(product.price),
    discountedPrice: product.discountedPrice
      ? Number(product.discountedPrice)
      : undefined,
  };

  return <ProductForm initialData={productData} />;
}
