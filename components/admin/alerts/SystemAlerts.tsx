"use client";

import { FiAlertCircle, FiPackage, FiUsers } from "react-icons/fi";

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
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      <h3 className="text-lg font-semibold mb-6">Alerts</h3>

      <div className="space-y-6">
        {/* Low stock section */}
        {lowstock?.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-orange-100 text-orange-600">
                <FiPackage />
              </div>
              <p className="font-medium text-gray-800">Low Stock</p>
            </div>

            <div className="space-y-2">
              {lowstock.map((product) => (
                <div
                  key={product.id}
                  className="flex justify-between text-sm text-gray-600"
                >
                  <span>{product.name}</span>
                  <span className="text-orange-600 font-medium">
                    {product.stock} left
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pending orders */}
        {orderStatus?.pending?.count > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
              <FiAlertCircle />
            </div>

            <div>
              <p className="font-medium text-gray-800">Pending Orders</p>
              <p className="text-sm text-gray-500">
                {orderStatus.pending.count} orders awaiting fulfillment
              </p>
            </div>
          </div>
        )}

        {/* New customers */}
        {newCustomers > 0 && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
              <FiUsers />
            </div>

            <div>
              <p className="font-medium text-gray-800">New Customers</p>
              <p className="text-sm text-gray-500">
                {newCustomers} new customers today
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
