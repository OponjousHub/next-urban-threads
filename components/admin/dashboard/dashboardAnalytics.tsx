import RevenueChart from "../charts/revenueChart";
import DashboardAlerts from "../alerts/systemAlerts";

export default function DashboardAnalytics({
  lowstock,
  orderStatus,
  newCustomers,
}: {
  lowstock: { id: string; name: string; stock: number }[];
  orderStatus: number;
  newCustomers: number;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="h-full">
        <RevenueChart />
      </div>

      <div className="h-full">
        <DashboardAlerts
          lowstock={lowstock}
          orderStatus={orderStatus}
          newCustomers={newCustomers}
        />
      </div>
    </section>
  );
}
