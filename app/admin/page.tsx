import KpiCard from "@/components/admin/KpiCard";
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
          icon={<FiDollarSign />}
        />
        <KpiCard title="Total Orders" value={320} icon={<FiShoppingBag />} />
        <KpiCard title="Customers" value={890} icon={<FiUsers />} />
        <KpiCard
          title="Conversion Rate"
          value={3.6}
          suffix="%"
          decimals={1}
          icon={<FiTrendingUp />}
        />
      </section>

      {/* Revenue Chart Placeholder */}
      <section className="bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-800">
            Revenue Analytics
          </h2>
          <span className="text-sm text-gray-500">Last 30 Days</span>
        </div>

        <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-50 rounded-xl flex items-center justify-center text-gray-400">
          Chart Placeholder
        </div>
      </section>

      {/* Recent Orders */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Recent Orders</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="flex justify-between items-center px-8 py-5 hover:bg-gray-50 transition"
            >
              <div>
                <p className="font-medium text-gray-800">Order #UT00{item}</p>
                <p className="text-sm text-gray-500">John Doe • 2 items</p>
              </div>

              <div className="text-right">
                <p className="font-semibold text-gray-900">$128.00</p>
                <span className="text-xs px-3 py-1 rounded-full bg-green-100 text-green-600 font-medium">
                  Paid
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
