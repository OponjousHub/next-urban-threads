"use client";

import { useState } from "react";
import {
  FiShoppingCart,
  FiUser,
  FiAlertTriangle,
  FiClock,
} from "react-icons/fi";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/formatCurrency";

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
          icon: <FiShoppingCart className="h-4 w-4" />,
          wrapper: "bg-emerald-50 text-emerald-600",
        };

      case "user":
        return {
          icon: <FiUser className="h-4 w-4" />,
          wrapper: "bg-indigo-50 text-indigo-600",
        };

      case "stock":
        return {
          icon: <FiAlertTriangle className="h-4 w-4" />,
          wrapper: "bg-amber-50 text-amber-600",
        };

      default:
        return {
          icon: <FiClock className="h-4 w-4" />,
          wrapper: "bg-gray-100 text-gray-500",
        };
    }
  };

  return (
    <div className="group h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <h3 className="text-base font-semibold tracking-tight text-gray-900">
            Recent Activity
          </h3>

          <p className="mt-1 text-xs text-gray-500">
            Latest activity across your store
          </p>
        </div>

        {activities?.length > 4 && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center rounded-lg px-3 py-2 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary-light)]/10"
          >
            {expanded ? "Show less" : "View all"}
          </button>
        )}
      </div>

      {/* Activity list */}
      {activities?.length > 0 ? (
        <div className="px-6 py-5">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute bottom-5 left-[15px] top-5 w-px bg-gray-100" />

            <div className="space-y-6">
              {visibleActivities?.map((activity) => {
                const { icon, wrapper } = getIcon(activity.type);

                return (
                  <div
                    key={activity.id}
                    className="relative flex items-start gap-4"
                  >
                    {/* Icon */}
                    <div
                      className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${wrapper}`}
                    >
                      {icon}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className="text-sm leading-5 text-gray-700">
                        {activity.message}
                      </p>

                      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-gray-400">
                        <FiClock className="h-3 w-3" />

                        <span>
                          {formatDistanceToNow(new Date(activity.time), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-gray-100">
            <FiClock className="h-5 w-5 text-gray-400" />
          </div>

          <p className="text-sm font-medium text-gray-700">
            No recent activity
          </p>

          <p className="mt-1 max-w-xs text-xs text-gray-400">
            Store activity will appear here as orders, customers, and inventory
            change.
          </p>
        </div>
      )}
    </div>
  );
}
