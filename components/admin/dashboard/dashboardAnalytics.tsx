import RevenueChart from "../charts/revenueChart";
import DashboardAlerts from "../alerts/systemAlerts";

export default function DashboardAnalytics({
  lowstock,
  orderStatus,
  newCustomers,
}: {
  lowstock: { id: string; name: string; stock: number }[];
  orderStatus: {
    paid: { count: number; revenue: number };
    pending: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
  };
  newCustomers: number;
}) {
  console.log("DASHBOARD Analytic Orderstatus", orderStatus);

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
