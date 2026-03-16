import OrdersStatusChart from "../charts/ordersStatusChart";
import SalesByCategoryChart from "../charts/salesByCategoryChart";

export default function DashboardSalesByCategory({
  orderStatus,
  catData,
}: {
  orderStatus: {
    paid: { count: number; revenue: number };
    pending: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
  };
  catData: {
    category: string;
    sales: number;
  }[];
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="xl:col-span-2">
        <SalesByCategoryChart data={catData} />
      </div>

      <OrdersStatusChart orderStatus={orderStatus} />
    </section>
  );
}
