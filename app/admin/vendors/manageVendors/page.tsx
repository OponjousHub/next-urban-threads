import VendorManagementPage from "@/components/admin/vendors/vendorManagementPage";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function ManageVendors() {
  return (
    <>
      <AdminHeaderUI
        title="Vendor Management"
        subtitle="Suspend or Reactivate vendors"
      />{" "}
      <VendorManagementPage />
    </>
  );
}
