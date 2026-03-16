"use client";

import { FiUsers, FiUserPlus, FiRepeat } from "react-icons/fi";

export default function CustomerInsights({
  totalCustomer,
  newCustomer,
}: {
  totalCustomer: number;
  newCustomer: number;
}) {
  const stats = [
    {
      title: "Total Customers",
      value: totalCustomer,
      icon: <FiUsers />,
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      title: "New Today",
      value: newCustomer,
      icon: <FiUserPlus />,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Returning",
      value: totalCustomer - newCustomer,
      icon: <FiRepeat />,
      color: "bg-blue-100 text-blue-600",
    },
  ];
  console.log(totalCustomer, newCustomer);
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-6">Customer Insights</h3>

      <div className="space-y-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}
              >
                {stat.icon}
              </div>

              <span className="text-sm text-gray-700">{stat.title}</span>
            </div>

            <span className="text-lg font-semibold text-gray-900">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
