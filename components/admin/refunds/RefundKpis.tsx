"use client";

import {
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiCreditCard,
  FiRefreshCw,
  FiXCircle,
} from "react-icons/fi";

type RefundKpisProps = {
  total: number;
  requested: number;
  approved: number;
  processing: number;
  refunded: number;
  failed: number;
};

export default function RefundKpis({
  total,
  requested,
  approved,
  processing,
  refunded,
  failed,
}: RefundKpisProps) {
  const stats = [
    {
      label: "Total Refunds",
      value: total,
      icon: FiRefreshCw,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-700",
    },
    {
      label: "Requested",
      value: requested,
      icon: FiClock,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-700",
    },
    {
      label: "Approved",
      value: approved,
      icon: FiCheckCircle,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-700",
    },
    {
      label: "Processing",
      value: processing,
      icon: FiCreditCard,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-700",
    },
    {
      label: "Refunded",
      value: refunded,
      icon: FiCheckCircle,
      iconBg: "bg-green-100",
      iconColor: "text-green-700",
    },
    {
      label: "Failed",
      value: failed,
      icon: FiAlertCircle,
      iconBg: "bg-red-100",
      iconColor: "text-red-700",
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {stats.map((stat) => {
        const Icon = stat.icon;

        return (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-medium text-gray-500">
                  {stat.label}
                </p>

                <p className="mt-2 text-2xl font-bold tracking-tight text-gray-900">
                  {stat.value}
                </p>
              </div>

              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${stat.iconBg}`}
              >
                <Icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
