import RecentOrdersTable from "../tables/recentOrdersTable";
import TopProducts from "@/components/admin/dashboard/topProducts";
// import OrdersStatusChart from "../charts/ordersStatusChart";

export default function DashboardAnalytics() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <RecentOrdersTable />
      </div>
      <div className="h-full">
        <TopProducts />
      </div>
    </section>
  );
}
