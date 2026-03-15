import OrdersStatusChart from "../charts/ordersStatusChart";
import SalesByCategoryChart from "../charts/salesByCategoryChart";

export default function DashboardSalesByCategory({
  orderStatus,
}: {
  orderStatus: {
    paid: { count: number; revenue: number };
    pending: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
  };
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="xl:col-span-2">
        <SalesByCategoryChart />
      </div>

      <OrdersStatusChart orderStatus={orderStatus} />
    </section>
  );
}
