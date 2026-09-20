"use client";

import { FiPackage, FiUsers, FiClock, FiTruck } from "react-icons/fi";

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
  /*
   * Determine whether the store has any order activity.
   *
   * This allows us to distinguish:
   *
   * 1. A brand-new store with no activity.
   * 2. An active store where everything currently looks good.
   */
  const totalOrderActivity =
    orderStatus.pending.count +
    orderStatus.processing.count +
    orderStatus.shipped.count +
    orderStatus.delivered.count +
    orderStatus.cancelled.count;

  const hasAnyStoreActivity =
    totalOrderActivity > 0 || newCustomers > 0 || lowstock.length > 0;

  const hasAlerts =
    lowstock.length > 0 ||
    orderStatus.pending.count > 0 ||
    orderStatus.processing.count > 0 ||
    newCustomers > 0;

  return (
    <div className="h-full rounded-2xl border border-gray-100 bg-white p-6 shadow-md">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Store Alerts</h3>

          <p className="mt-1 text-sm text-gray-500">
            Items that may need your attention
          </p>
        </div>
      </div>

      {!hasAlerts ? (
        <div className="flex min-h-[260px] flex-col items-center justify-center px-4 text-center">
          {/* Empty store */}
          {!hasAnyStoreActivity ? (
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                <FiPackage className="text-2xl" />
              </div>

              <h4 className="font-semibold text-gray-900">
                Your store is ready
              </h4>

              <p className="mt-1 max-w-xs text-sm leading-5 text-gray-500">
                Important alerts will appear here once your store has products,
                orders, and customer activity.
              </p>
            </>
          ) : (
            /* Existing store with no current alerts */
            <>
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                <FiPackage className="text-2xl" />
              </div>

              <h4 className="font-semibold text-gray-900">
                Everything looks good
              </h4>

              <p className="mt-1 max-w-xs text-sm leading-5 text-gray-500">
                No low-stock products, pending orders, or other immediate
                alerts.
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Low Stock */}
          {lowstock.length > 0 && (
            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <div className="mb-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
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
                    <span className="truncate pr-4 text-gray-700">
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
            <div className="flex items-center gap-4 rounded-xl border border-amber-100 bg-amber-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
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
            <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
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
            <div className="flex items-center gap-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
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
