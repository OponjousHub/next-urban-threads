"use client";

import { FiAlertCircle, FiPackage, FiUsers } from "react-icons/fi";

export default function DashboardAlerts() {
  const alerts = [
    {
      icon: <FiPackage />,
      title: "Low Stock",
      message: "3 products running low",
      color: "text-orange-600 bg-orange-100",
    },
    {
      icon: <FiAlertCircle />,
      title: "Pending Orders",
      message: "5 orders awaiting fulfillment",
      color: "text-yellow-600 bg-yellow-100",
    },
    {
      icon: <FiUsers />,
      title: "New Customers",
      message: "12 new customers today",
      color: "text-indigo-600 bg-indigo-100",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-6">Alerts</h3>

      <div className="space-y-4">
        {alerts.map((alert, i) => (
          <div
            key={i}
            className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition"
          >
            <div
              className={`w-10 h-10 rounded-lg flex items-center justify-center ${alert.color}`}
            >
              {alert.icon}
            </div>

            <div>
              <p className="font-medium text-gray-800">{alert.title}</p>
              <p className="text-sm text-gray-500">{alert.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
