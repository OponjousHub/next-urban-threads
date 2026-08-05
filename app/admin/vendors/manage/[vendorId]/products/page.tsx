import VendorProductsPage from "@/components/admin/vendors/vendorProductsPage";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return (
    <>
      <AdminHeaderUI title="Vendor Products" subtitle="View Vendor Products" />
      <VendorProductsPage vendorId={vendorId} />
    </>
  );
}
