import KpiCard from "../KpiCard";
import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";
export default function DashboardAnalytics() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <KpiCard
        title="Total Revenue"
        value={12450}
        prefix="$"
        change={8}
        icon={<FiDollarSign />}
      />

      <KpiCard
        title="Total Orders"
        value={320}
        icon={<FiShoppingBag />}
        change={-5}
      />

      <KpiCard title="Customers" value={890} icon={<FiUsers />} change={12} />
      <KpiCard
        title="Conversion Rate"
        value={3.6}
        suffix="%"
        change={0}
        decimals={1}
        icon={<FiTrendingUp />}
      />
    </section>
  );
}
