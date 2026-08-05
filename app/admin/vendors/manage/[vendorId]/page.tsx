import VendorDetailPage from "@/components/admin/vendors/vendorDetailPage";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function Page({
  params,
}: {
  params: Promise<{ vendorId: string }>;
}) {
  const { vendorId } = await params;

  return (
    <>
      <AdminHeaderUI
        title="Vendor Management"
        subtitle="View vendor details, products, orders and admin note."
      />
      <VendorDetailPage vendorId={vendorId} />
    </>
  );
}
