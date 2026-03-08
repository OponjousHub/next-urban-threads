import RecentOrdersTable from "../tables/recentOrdersTable";
import TopProducts from "@/components/admin/dashboard/topProducts";
import OrdersStatusChart from "../charts/ordersStatusChart";

export default function DashboardAnalytics() {
  return (
    <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2">
        <RecentOrdersTable />
      </div>

      <OrdersStatusChart />
    </section>
  );
}
