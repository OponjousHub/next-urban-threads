import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { ProductForm } from "@/components/products/productForm";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const param = await params;
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [product, user] = await Promise.all([
    prisma.product.findUnique({
      where: { id: param.id, tenantId: tenant.id },
      include: {
        variants: true,
      },
    }),
    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),
  ]);

  if (!product) return notFound();

  const productData = {
    ...product,
    price: Number(product.price),
    discountedPrice: product.discountedPrice
      ? Number(product.discountedPrice)
      : undefined,
  };

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <ProductForm
      initialData={productData}
      basePath={"/admin/products"}
      admin={admin}
    />
  );
}
