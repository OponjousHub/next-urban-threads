"use client";

import { useRouter } from "next/navigation";
import {
  FiAlertCircle,
  FiPackage,
  FiUsers,
  FiCheckCircle,
  FiChevronRight,
} from "react-icons/fi";

export default function DashboardAlerts({
  lowstock,
  orderStatus,
  newCustomers,
}: {
  lowstock: { id: string; name: string; stock: number }[];
  orderStatus: {
    paid: { count: number; revenue: number };
    pending: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
  };
  newCustomers: number;
}) {
  const router = useRouter();

  const hasLowStock = lowstock?.length > 0;
  const hasPendingOrders = orderStatus?.pending?.count > 0;
  const hasNewCustomers = newCustomers > 0;

  const hasAlerts = hasLowStock || hasPendingOrders || hasNewCustomers;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>

          <p className="text-sm text-gray-500 mt-1">
            Items that may need your attention
          </p>
        </div>

        {hasAlerts && (
          <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
            {Number(hasLowStock) +
              Number(hasPendingOrders) +
              Number(hasNewCustomers)}
          </span>
        )}
      </div>

      {/* Everything is okay */}
      {!hasAlerts && (
        <div className="flex flex-col items-center justify-center min-h-[220px] text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
            <FiCheckCircle className="h-6 w-6" />
          </div>

          <p className="font-medium text-gray-900">Everything looks good</p>

          <p className="text-sm text-gray-500 mt-1 max-w-xs">
            There are no urgent alerts or actions requiring your attention.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Low stock */}
        {hasLowStock && (
          <div
            onClick={() => router.push("/admin/products")}
            className="group cursor-pointer rounded-xl border border-orange-100 bg-orange-50/40 p-4 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <FiPackage className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-gray-900">Low stock</p>

                  <FiChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
                </div>

                <p className="text-sm text-gray-500 mt-1">
                  {lowstock.length}{" "}
                  {lowstock.length === 1 ? "product needs" : "products need"}{" "}
                  restocking.
                </p>

                <div className="mt-3 space-y-2">
                  {lowstock.slice(0, 3).map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span className="truncate text-gray-700">
                        {product.name}
                      </span>

                      <span className="shrink-0 font-medium text-orange-600">
                        {product.stock} left
                      </span>
                    </div>
                  ))}

                  {lowstock.length > 3 && (
                    <p className="text-xs text-orange-600 font-medium pt-1">
                      +{lowstock.length - 3} more
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pending orders */}
        {hasPendingOrders && (
          <div
            onClick={() => router.push("/admin/orders?status=PENDING")}
            className="group flex items-center gap-4 cursor-pointer rounded-xl border border-yellow-100 bg-yellow-50/40 p-4 transition-all duration-200 hover:border-yellow-200 hover:bg-yellow-50"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <FiAlertCircle className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-gray-900">Pending orders</p>

                <FiChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
              </div>

              <p className="text-sm text-gray-500 mt-1">
                {orderStatus.pending.count}{" "}
                {orderStatus.pending.count === 1 ? "order" : "orders"} awaiting
                fulfillment.
              </p>
            </div>
          </div>
        )}

        {/* New customers */}
        {hasNewCustomers && (
          <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FiUsers className="h-5 w-5" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="font-medium text-gray-900">New customers</p>

              <p className="text-sm text-gray-500 mt-1">
                {newCustomers} {newCustomers === 1 ? "customer" : "customers"}{" "}
                joined today.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
