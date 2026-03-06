import KpiCard from "@/components/admin/KpiCard";
import RevenueChart from "@/components/admin/charts/revenueChart";
import RecentOrdersTable from "@/components/admin/tables/recentOrdersTable";

import {
  FiDollarSign,
  FiShoppingBag,
  FiUsers,
  FiTrendingUp,
} from "react-icons/fi";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back. Here's what's happening in Urban Threads.
        </p>
      </div>

      {/* KPI Cards */}
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

      {/* Revenue Chart */}
      <div className="grid grid-cols-1 gap-6 mt-6">
        <RevenueChart />
      </div>

      {/* Recent Orders */}
      <section>
        <RecentOrdersTable />
      </section>
    </div>
  );
}
