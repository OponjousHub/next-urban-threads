// app/admin/vendors/manage/[vendorId]/products/page.tsx

import VendorProductsPage from "@/components/admin/vendors/vendorProductsPage";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return <VendorProductsPage vendorId={vendorId} />;
}
