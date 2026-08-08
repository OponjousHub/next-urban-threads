"use client";

import { FiUsers, FiUserPlus, FiRepeat, FiArrowUpRight } from "react-icons/fi";

export default function CustomerInsights({
  totalCustomer,
  newCustomer,
}: {
  totalCustomer: number;
  newCustomer: number;
}) {
  const safeTotal = Math.max(totalCustomer ?? 0, 0);
  const safeNew = Math.max(newCustomer ?? 0, 0);

  const returningCustomers = Math.max(safeTotal - safeNew, 0);

  const newCustomerRate = safeTotal > 0 ? (safeNew / safeTotal) * 100 : 0;

  const returningCustomerRate =
    safeTotal > 0 ? (returningCustomers / safeTotal) * 100 : 0;

  const stats = [
    {
      title: "Total Customers",
      value: safeTotal,
      description: "All registered customers",
      icon: <FiUsers className="h-4 w-4" />,
      wrapper: "bg-indigo-50 text-indigo-600",
    },
    {
      title: "New Today",
      value: safeNew,
      description: `${newCustomerRate.toFixed(1)}% of customers`,
      icon: <FiUserPlus className="h-4 w-4" />,
      wrapper: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Returning",
      value: returningCustomers,
      description: `${returningCustomerRate.toFixed(1)}% of customers`,
      icon: <FiRepeat className="h-4 w-4" />,
      wrapper: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="border-b border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold tracking-tight text-gray-900">
              Customer Insights
            </h3>

            <p className="mt-1 text-xs text-gray-500">
              Understand your customer base
            </p>
          </div>

          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
            <FiUsers className="h-4 w-4" />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="space-y-3 px-6 py-5">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className="flex items-center justify-between rounded-xl border border-transparent bg-gray-50/70 p-4 transition-all duration-200 hover:border-gray-100 hover:bg-gray-50"
          >
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${stat.wrapper}`}
              >
                {stat.icon}
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {stat.title}
                </p>

                <p className="mt-0.5 truncate text-xs text-gray-400">
                  {stat.description}
                </p>
              </div>
            </div>

            <div className="ml-4 flex shrink-0 items-center gap-1">
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                {stat.value.toLocaleString()}
              </span>

              <FiArrowUpRight className="h-3.5 w-3.5 text-gray-300" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
