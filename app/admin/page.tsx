import AdminDashboard from "@/app/admin/dashboard/adminDashboard";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getDefaultTenant } from "../lib/getDefaultTenant";

export default async function AdminDashboardPage() {
  const tenant = await getDefaultTenant();
  return (
    <>
      <AdminHeaderUI
        title={`${tenant?.storeMode === "MULTI_VENDOR" ? "Marketplace Overview." : "Dashboard Overview"}`}
        subtitle={`Here's what's happening ${tenant?.storeMode === "MULTI_VENDOR" ? "across all vendors." : "in your store"} `}
      />
      <AdminDashboard />;
    </>
  );
}
