import VendorAprovalPage from "@/components/admin/vendors/vendorApprovalPage";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function VendorApplication() {
  return (
    <>
      <AdminHeaderUI
        title="Vendor applications"
        subtitle="Manage Vendor applications"
      />
      <VendorAprovalPage />
    </>
  );
}
