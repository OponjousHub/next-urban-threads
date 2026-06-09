import VendorDetailPage from "@/components/admin/vendors/vendorDetailPage";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return <VendorDetailPage vendorId={vendorId} />;
}
