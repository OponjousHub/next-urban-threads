import AdminDashboard from "@/app/admin/dashboard/adminDashboard";
import AdminHeader from "@/components/admin/adminHeader";

export default function AdminDashboardPage() {
  return (
    <>
      <AdminHeader
        title="Marketplace Overview."
        subtitle="Here's what's happening across all vendors."
      />
      <AdminDashboard />;
    </>
  );
}
