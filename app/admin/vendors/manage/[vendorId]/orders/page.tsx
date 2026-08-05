import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import VendorOrdersPage from "@/components/admin/vendors/vendorOrdersPage";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return (
    <>
      <AdminHeaderUI title="Vendor Orders" subtitle="View Vendor Orders" />
      <VendorOrdersPage vendorId={vendorId} />
    </>
  );
}
