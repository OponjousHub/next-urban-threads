// app/admin/vendors/manage/[vendorId]/orders/page.tsx

import VendorOrdersPage from "@/components/admin/vendors/vendorOrdersPage";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return <VendorOrdersPage vendorId={vendorId} />;
}
