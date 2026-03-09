import KpiCard from "../KpiCard";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
  FiRepeat,
  FiBarChart2,
} from "react-icons/fi";
export default function DashboardAnalytics({
  totalRevenue,
  totalCustomer,
  totalOrder,
  conversion,
  returningCustomerRate,
}: {
  totalRevenue: number;
  totalCustomer: number;
  totalOrder: number;
  conversion: number;
  returningCustomerRate: number;
}) {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <KpiCard
        title="Total Revenue"
        value={totalRevenue}
        prefix="$"
        change={8}
        icon={<FiDollarSign />}
      />

      <KpiCard
        title="Average Order Value"
        value={totalOrder > 0 ? totalRevenue / totalOrder : 0}
        prefix="$"
        decimals={2}
        icon={<FiBarChart2 />}
        change={0}
      />

      <KpiCard
        title="Total Orders"
        value={totalOrder}
        icon={<FiShoppingBag />}
        change={-5}
      />

      <KpiCard
        title="Customers"
        value={totalCustomer}
        icon={<FiUsers />}
        change={12}
      />
      <KpiCard
        title="Conversion Rate"
        value={conversion}
        suffix="%"
        change={0}
        decimals={1}
        icon={<FiTrendingUp />}
      />
      <KpiCard
        title="Returning Customers"
        value={returningCustomerRate}
        suffix="%"
        decimals={1}
        icon={<FiRepeat />}
        change={0}
      />
    </section>
  );
}
