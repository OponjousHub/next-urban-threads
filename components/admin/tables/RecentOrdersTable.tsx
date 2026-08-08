"use client";

import Link from "next/link";
import Avatar from "@/utils/avatar";
import { FiArrowRight, FiCalendar, FiShoppingBag } from "react-icons/fi";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
  orders: RecentOrder[];
  currency: string;
};

type RecentOrderStatus = "Paid" | "Pending" | "Cancelled";

type RecentOrder = {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: string;
  date: string | Date;
};

export default function RecentOrdersTable({ orders, currency }: Props) {
  console.log("ORDER STATUSssss", orders);
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
              <tr className="border-b border-gray-100 bg-gray-50/40">
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

            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => (
                <tr
                  key={order.id}
                  className="group transition-colors duration-200 hover:bg-gray-50/80"
                >
                  {/* Order */}
                  <td className="px-6 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex items-center gap-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-gray-400 ring-1 ring-inset ring-gray-200 transition-all duration-200 group-hover:bg-[var(--color-primary-light)] group-hover:text-[var(--color-primary)] group-hover:ring-transparent">
                        <FiShoppingBag size={15} />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-semibold tracking-tight text-gray-800 transition-colors group-hover:text-[var(--color-primary)]">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>

                        <p className="mt-0.5 text-[11px] text-gray-400">
                          Order
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Customer */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <Avatar name={order.customer} />
                      </div>

                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-800">
                          {order.customer}
                        </p>

                        <p className="mt-0.5 max-w-[190px] truncate text-xs text-gray-400">
                          {order.email}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4">
                    <p className="text-sm font-semibold tracking-tight text-gray-900">
                      {formatCurrency(order.amount, currency)}
                    </p>
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    <StatusBadge status={order.status} />
                  </td>

                  {/* Date */}
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2 text-xs text-gray-500">
                      <FiCalendar size={13} className="text-gray-300" />

                      <span>
                        {new Date(order.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
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

function StatusBadge({ status }: { status: RecentOrder["status"] }) {
  const styles: Record<
    RecentOrder["status"],
    {
      wrapper: string;
      dot: string;
    }
  > = {
    PENDING: {
      wrapper: "bg-amber-50 text-amber-700",
      dot: "bg-amber-500",
    },
    PROCESSING: {
      wrapper: "bg-blue-50 text-blue-700",
      dot: "bg-blue-500",
    },
    SHIPPED: {
      wrapper: "bg-indigo-50 text-indigo-700",
      dot: "bg-indigo-500",
    },
    DELIVERED: {
      wrapper: "bg-emerald-50 text-emerald-700",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      wrapper: "bg-red-50 text-red-700",
      dot: "bg-red-500",
    },
  };

  const labels: Record<RecentOrder["status"], string> = {
    PENDING: "Pending",
    PROCESSING: "Processing",
    SHIPPED: "Shipped",
    DELIVERED: "Delivered",
    CANCELLED: "Cancelled",
  };

  const style = styles[status];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-xs font-medium ${style?.wrapper}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style?.dot}`} />

      {labels[status]}
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
