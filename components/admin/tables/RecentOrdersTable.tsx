// "use client";

// import Avatar from "@/utils/avatar";
// import { formatCurrency } from "@/lib/formatCurrency";

// interface Order {
//   id: string;
//   customer: string;
//   email: string;
//   amount: number;
//   status: "Paid" | "Pending" | "Cancelled";
//   date: string | Date;
// }

// export default function RecentOrdersTable({
//   orders,
//   currency,
// }: {
//   orders: Order[];
//   currency: string;
// }) {
//   return (
//     <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
//       <div className="flex justify-between items-center mb-6">
//         <h3 className="text-lg font-semibold">Recent Orders</h3>
//         <button className="text-sm text-[var(--color-primary)] hover:underline">
//           View all
//         </button>
//       </div>

//       <div className="overflow-x-auto">
//         <table className="w-full text-sm">
//           <thead className="text-left text-gray-500 border-b border-gray-100">
//             <tr>
//               <th className="pb-3">Order</th>
//               <th className="pb-3">Customer</th>
//               <th className="pb-3">Amount</th>
//               <th className="pb-3">Status</th>
//               <th className="pb-3">Date</th>
//             </tr>
//           </thead>

//           <tbody>
//             {orders?.map((order) => (
//               <tr
//                 key={order.id}
//                 className="border-b border-gray-50 hover:bg-gray-50 transition"
//               >
//                 <td className="py-4 font-medium text-gray-800">
//                   {order.id.slice(0, 8)}
//                 </td>

//                 <td className="py-4">
//                   <div className="flex items-center gap-3">
//                     <Avatar name={order.customer} />
//                     <div>
//                       <p className="font-medium">{order.customer}</p>
//                       <p className="text-xs text-gray-500">{order.email}</p>
//                     </div>
//                   </div>
//                 </td>

//                 <td className="py-4 font-medium">
//                   {formatCurrency(order.amount, currency)}{" "}
//                 </td>

//                 <td className="py-4">
//                   <StatusBadge status={order.status} />
//                 </td>

//                 <td className="py-4 text-gray-500">
//                   {new Date(order.date).toLocaleDateString("en-US", {
//                     month: "short",
//                     day: "numeric",
//                     year: "numeric",
//                   })}
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// }

// function StatusBadge({ status }: { status: Order["status"] }) {
//   const styles = {
//     Paid: "bg-green-100 text-green-600",
//     Pending: "bg-yellow-100 text-yellow-600",
//     Cancelled: "bg-red-100 text-red-600",
//   };

//   return (
//     <span
//       className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}
//     >
//       {status}
//     </span>
//   );
// }

"use client";

import Link from "next/link";
import Avatar from "@/utils/avatar";
import { FiArrowRight, FiCalendar, FiShoppingBag } from "react-icons/fi";
import { formatCurrency } from "@/lib/formatCurrency";

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "Paid" | "Pending" | "Cancelled";
  date: string | Date;
}

interface Props {
  orders: Order[];
  currency: string;
}

export default function RecentOrdersTable({ orders, currency }: Props) {
  return (
    <div className="h-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-shadow duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold tracking-tight text-gray-900">
              Recent Orders
            </h3>

            {orders?.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                {orders.length}
              </span>
            )}
          </div>

          <p className="mt-1 text-xs text-gray-500">
            Latest orders from your store
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="group inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-primary)] transition-colors hover:opacity-80"
        >
          View all
          <FiArrowRight
            className="transition-transform duration-200 group-hover:translate-x-0.5"
            size={15}
          />
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        {orders?.length > 0 ? (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Order
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Customer
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Amount
                </th>

                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>

                <th className="px-6 py-3 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Date
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="group transition-colors duration-200 hover:bg-gray-50/70"
                >
                  {/* Order */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-2"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)]">
                        <FiShoppingBag size={14} />
                      </span>

                      <div>
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-[var(--color-primary)]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>

                        <p className="text-[11px] text-gray-400">Order</p>
                      </div>
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={order.customer} />

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {order.customer}
                        </p>

                        <p className="max-w-[180px] truncate text-xs text-gray-400">
                          {order.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatCurrency(order.amount, currency)}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5 text-xs text-gray-500">
                      <FiCalendar size={13} className="text-gray-400" />

                      {new Date(order.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyOrders />
        )}
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        {orders?.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.id}`}
                className="block px-5 py-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Customer */}
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar name={order.customer} />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-800">
                        {order.customer}
                      </p>

                      <p className="truncate text-xs text-gray-400">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <span className="shrink-0 text-sm font-semibold text-gray-900">
                    {formatCurrency(order.amount, currency)}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge status={order.status} />

                  <span className="flex items-center gap-1.5 text-xs text-gray-400">
                    <FiCalendar size={12} />

                    {new Date(order.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyOrders />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------
   Status Badge
------------------------------------------------------- */

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    Paid: {
      wrapper: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
      dot: "bg-emerald-500",
    },

    Pending: {
      wrapper: "bg-amber-50 text-amber-700 ring-amber-600/10",
      dot: "bg-amber-500",
    },

    Cancelled: {
      wrapper: "bg-red-50 text-red-700 ring-red-600/10",
      dot: "bg-red-500",
    },
  };

  const style = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ring-inset ${style?.wrapper}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style?.dot}`} />

      {status}
    </span>
  );
}

/* -------------------------------------------------------
   Empty State
------------------------------------------------------- */

function EmptyOrders() {
  return (
    <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 text-gray-400">
        <FiShoppingBag size={20} />
      </div>

      <p className="text-sm font-semibold text-gray-800">No orders yet</p>

      <p className="mt-1 max-w-xs text-xs text-gray-400">
        Your latest customer orders will appear here once they start coming in.
      </p>
    </div>
  );
}
