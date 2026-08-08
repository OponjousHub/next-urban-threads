// "use client";

// import { useRouter } from "next/navigation";
// import {
//   FiAlertCircle,
//   FiPackage,
//   FiUsers,
//   FiCheckCircle,
//   FiChevronRight,
// } from "react-icons/fi";

// export default function DashboardAlerts({
//   lowstock,
//   orderStatus,
//   newCustomers,
// }: {
//   lowstock: { id: string; name: string; stock: number }[];
//   orderStatus: {
//     paid: { count: number; revenue: number };
//     pending: { count: number; revenue: number };
//     cancelled: { count: number; revenue: number };
//     delivered: { count: number; revenue: number };
//   };
//   newCustomers: number;
// }) {
//   const router = useRouter();

//   const hasLowStock = lowstock?.length > 0;
//   const hasPendingOrders = orderStatus?.pending?.count > 0;
//   const hasNewCustomers = newCustomers > 0;

//   const hasAlerts = hasLowStock || hasPendingOrders || hasNewCustomers;

//   return (
//     <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-semibold text-gray-900">Alerts</h3>

//           <p className="text-sm text-gray-500 mt-1">
//             Items that may need your attention
//           </p>
//         </div>

//         {hasAlerts && (
//           <span className="inline-flex items-center justify-center min-w-7 h-7 px-2 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold">
//             {Number(hasLowStock) +
//               Number(hasPendingOrders) +
//               Number(hasNewCustomers)}
//           </span>
//         )}
//       </div>

//       {/* Everything is okay */}
//       {!hasAlerts && (
//         <div className="flex flex-col items-center justify-center min-h-[220px] text-center">
//           <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-600 mb-4">
//             <FiCheckCircle className="h-6 w-6" />
//           </div>

//           <p className="font-medium text-gray-900">Everything looks good</p>

//           <p className="text-sm text-gray-500 mt-1 max-w-xs">
//             There are no urgent alerts or actions requiring your attention.
//           </p>
//         </div>
//       )}

//       <div className="space-y-4">
//         {/* Low stock */}
//         {hasLowStock && (
//           <div
//             onClick={() => router.push("/admin/products")}
//             className="group cursor-pointer rounded-xl border border-orange-100 bg-orange-50/40 p-4 transition-all duration-200 hover:border-orange-200 hover:bg-orange-50"
//           >
//             <div className="flex items-start gap-4">
//               <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-orange-600">
//                 <FiPackage className="h-5 w-5" />
//               </div>

//               <div className="min-w-0 flex-1">
//                 <div className="flex items-center justify-between gap-3">
//                   <p className="font-medium text-gray-900">Low stock</p>

//                   <FiChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
//                 </div>

//                 <p className="text-sm text-gray-500 mt-1">
//                   {lowstock.length}{" "}
//                   {lowstock.length === 1 ? "product needs" : "products need"}{" "}
//                   restocking.
//                 </p>

//                 <div className="mt-3 space-y-2">
//                   {lowstock.slice(0, 3).map((product) => (
//                     <div
//                       key={product.id}
//                       className="flex items-center justify-between gap-3 text-sm"
//                     >
//                       <span className="truncate text-gray-700">
//                         {product.name}
//                       </span>

//                       <span className="shrink-0 font-medium text-orange-600">
//                         {product.stock} left
//                       </span>
//                     </div>
//                   ))}

//                   {lowstock.length > 3 && (
//                     <p className="text-xs text-orange-600 font-medium pt-1">
//                       +{lowstock.length - 3} more
//                     </p>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Pending orders */}
//         {hasPendingOrders && (
//           <div
//             onClick={() => router.push("/admin/orders?status=PENDING")}
//             className="group flex items-center gap-4 cursor-pointer rounded-xl border border-yellow-100 bg-yellow-50/40 p-4 transition-all duration-200 hover:border-yellow-200 hover:bg-yellow-50"
//           >
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yellow-100 text-yellow-600">
//               <FiAlertCircle className="h-5 w-5" />
//             </div>

//             <div className="min-w-0 flex-1">
//               <div className="flex items-center justify-between gap-3">
//                 <p className="font-medium text-gray-900">Pending orders</p>

//                 <FiChevronRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
//               </div>

//               <p className="text-sm text-gray-500 mt-1">
//                 {orderStatus.pending.count}{" "}
//                 {orderStatus.pending.count === 1 ? "order" : "orders"} awaiting
//                 fulfillment.
//               </p>
//             </div>
//           </div>
//         )}

//         {/* New customers */}
//         {hasNewCustomers && (
//           <div className="flex items-center gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 p-4">
//             <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
//               <FiUsers className="h-5 w-5" />
//             </div>

//             <div className="min-w-0 flex-1">
//               <p className="font-medium text-gray-900">New customers</p>

//               <p className="text-sm text-gray-500 mt-1">
//                 {newCustomers} {newCustomers === 1 ? "customer" : "customers"}{" "}
//                 joined today.
//               </p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
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
