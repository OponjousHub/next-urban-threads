import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { ProductForm } from "@/components/products/productForm";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const param = await params;
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  const product = await prisma.product.findUnique({
    where: { id: param.id, tenantId: tenant.id },
    include: {
      variants: true,
    },
  });

  if (!product) return notFound();

  const productData = {
    ...product,
    price: Number(product.price),
    discountedPrice: product.discountedPrice
      ? Number(product.discountedPrice)
      : undefined,
  };

  return <ProductForm initialData={productData} basePath={"/admin/products"} />;
}
