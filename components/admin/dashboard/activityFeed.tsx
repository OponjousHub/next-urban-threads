"use client";

import { useState } from "react";
import { FiShoppingCart, FiUser, FiAlertTriangle } from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";

interface Activity {
  id: string;
  type: "order" | "user" | "stock";
  message: string;
  time: Date;
}

interface Props {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: Props) {
  const [expanded, setExpanded] = useState(false);

  const visibleActivities = expanded ? activities : activities?.slice(0, 4);

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "order":
        return {
          icon: <FiShoppingCart />,
          color: "text-green-600 bg-green-100",
        };
      case "user":
        return {
          icon: <FiUser />,
          color: "text-indigo-600 bg-indigo-100",
        };
      case "stock":
        return {
          icon: <FiAlertTriangle />,
          color: "text-orange-600 bg-orange-100",
        };
      default:
        return {
          icon: <FiShoppingCart />,
          color: "text-gray-600 bg-gray-100",
        };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Activity</h3>

        {activities?.length > 4 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="text-sm text-indigo-600 hover:underline"
          >
            {expanded ? "Show less" : "View all"}
          </button>
        )}
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200" />

        <div className="space-y-6">
          {visibleActivities?.map((activity) => {
            const { icon, color } = getIcon(activity.type);

            return (
              <div
                key={activity.id}
                className="relative flex items-start gap-4"
              >
                {/* Icon */}
                <div
                  className={`relative z-10 w-8 h-8 rounded-lg flex items-center justify-center ${color}`}
                >
                  {icon}
                </div>

                {/* Text */}
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.message}</p>

                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(activity.time), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
