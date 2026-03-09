"use client";

import {
  FiShoppingCart,
  FiUser,
  FiPackage,
  FiAlertTriangle,
} from "react-icons/fi";

interface Activity {
  id: number;
  icon: React.ReactNode;
  message: string;
  time: string;
  color: string;
}

const activities: Activity[] = [
  {
    id: 1,
    icon: <FiShoppingCart />,
    message: "John Doe placed an order ($120)",
    time: "2 minutes ago",
    color: "text-green-600 bg-green-100",
  },
  {
    id: 2,
    icon: <FiUser />,
    message: "Sarah Johnson created an account",
    time: "10 minutes ago",
    color: "text-indigo-600 bg-indigo-100",
  },
  {
    id: 3,
    icon: <FiPackage />,
    message: "Order #233 shipped",
    time: "30 minutes ago",
    color: "text-blue-600 bg-blue-100",
  },
  {
    id: 4,
    icon: <FiAlertTriangle />,
    message: "Slim Jeans stock running low",
    time: "1 hour ago",
    color: "text-orange-600 bg-orange-100",
  },
];

export default function ActivityFeed() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-6">Recent Activity</h3>

      {/* Activity list */}
      <div className="space-y-4">
        {activities.map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition"
          >
            {/* Icon */}
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${activity.color}`}
            >
              {activity.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <p className="text-sm text-gray-800">{activity.message}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
