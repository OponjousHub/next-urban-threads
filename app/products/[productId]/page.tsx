import { ProductDetailUI } from "@/components/productDetailsUI";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/products/productDetailSkeleton";
import { useTenant } from "@/store/tenant-provider-context";

async function getProduct(id: string) {
  const { tenant } = useTenant();

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${id}`,
    {
      cache: "no-store", // or 'force-cache' if products are static
    },
  );
  if (res.status === 404) {
    notFound();
  }

  if (!res.ok) {
    throw new Error("Failed to fetch product");
  }

  return res.json();
}

export default async function ProductDetailPage({
  params,
}: {
  params: { productId: string };
}) {
  const product = await getProduct(params.productId);
  const { tenant } = useTenant();

  return (
    <Suspense fallback={<ProductDetailSkeleton />}>
      <ProductDetailUI product={product} />
    </Suspense>
  );
}
