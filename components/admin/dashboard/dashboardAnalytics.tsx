import RevenueChart from "../charts/revenueChart";
import DashboardAlerts from "../alerts/systemAlerts";

export default function DashboardAnalytics({
  totalRevenue,
  totalOrders,
}: {
  totalRevenue: number;
  totalOrders: number;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <RevenueChart />
      </div>

      <div className="h-full">
        <DashboardAlerts />
      </div>
    </section>
  );
}
