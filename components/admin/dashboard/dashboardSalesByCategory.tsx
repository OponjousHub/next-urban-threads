import OrdersStatusChart from "../charts/ordersStatusChart";
import SalesByCategoryChart from "../charts/salesByCategoryChart";

export default function DashboardSalesByCategory({
  orderStatus,
  catData,
  currency,
}: {
  orderStatus: {
    pending: { count: number; revenue: number };
    processing: { count: number; revenue: number };
    shipped: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
  };
  catData: {
    category: string;
    sales: number;
  }[];
  currency: string;
}) {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
      <div className="xl:col-span-2">
        <SalesByCategoryChart data={catData} />
      </div>

      <OrdersStatusChart
        orderStatus={orderStatus}
        currency={currency}
      />
    </section>
  );
}
