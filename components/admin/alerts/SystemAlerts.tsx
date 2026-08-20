"use client";

import {
  FiAlertCircle,
  FiPackage,
  FiUsers,
  FiClock,
  FiTruck,
} from "react-icons/fi";

type OrderStatusStats = {
  pending: {
    count: number;
    revenue: number;
  };
  processing: {
    count: number;
    revenue: number;
  };
  shipped: {
    count: number;
    revenue: number;
  };
  delivered: {
    count: number;
    revenue: number;
  };
  cancelled: {
    count: number;
    revenue: number;
  };
};

export default function DashboardAlerts({
  lowstock,
  orderStatus,
  newCustomers,
}: {
  lowstock: {
    id: string;
    name: string;
    stock: number;
  }[];
  orderStatus: OrderStatusStats;
  newCustomers: number;
}) {
  const hasAlerts =
    lowstock.length > 0 ||
    orderStatus.pending.count > 0 ||
    orderStatus.processing.count > 0 ||
    newCustomers > 0;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Store Alerts</h3>
          <p className="text-sm text-gray-500 mt-1">
            Items that may need your attention
          </p>
        </div>
      </div>

      {!hasAlerts ? (
        <div className="flex flex-col items-center justify-center min-h-[260px] text-center">
          <div className="w-14 h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
            <FiPackage className="text-2xl" />
          </div>

          <h4 className="font-semibold text-gray-900">Everything looks good</h4>

          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            No low-stock products, pending orders, or other immediate alerts.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Low Stock */}
          {lowstock.length > 0 && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                  <FiPackage />
                </div>

                <div>
                  <p className="font-medium text-gray-900">Low Stock</p>
                  <p className="text-xs text-gray-500">
                    {lowstock.length} product
                    {lowstock.length !== 1 ? "s" : ""} need attention
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {lowstock.slice(0, 4).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="text-gray-700 truncate pr-4">
                      {product.name}
                    </span>

                    <span className="shrink-0 font-medium text-orange-600">
                      {product.stock} left
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pending Orders */}
          {orderStatus.pending.count > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FiClock />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-900">Pending Orders</p>

                <p className="text-sm text-gray-500">
                  {orderStatus.pending.count} order
                  {orderStatus.pending.count !== 1 ? "s" : ""} awaiting
                  processing
                </p>
              </div>
            </div>
          )}

          {/* Processing Orders */}
          {orderStatus.processing.count > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                <FiTruck />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-900">Processing Orders</p>

                <p className="text-sm text-gray-500">
                  {orderStatus.processing.count} order
                  {orderStatus.processing.count !== 1 ? "s" : ""} currently
                  being processed
                </p>
              </div>
            </div>
          )}

          {/* New Customers */}
          {newCustomers > 0 && (
            <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <div className="w-10 h-10 shrink-0 flex items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                <FiUsers />
              </div>

              <div className="min-w-0">
                <p className="font-medium text-gray-900">New Customers</p>

                <p className="text-sm text-gray-500">
                  {newCustomers} new customer
                  {newCustomers !== 1 ? "s" : ""} today
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
