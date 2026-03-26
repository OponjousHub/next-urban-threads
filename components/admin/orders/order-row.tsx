"use client";

import { FiMoreVertical } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// types/order.ts
export type Order = {
  id: string;
  createdAt: Date;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  status: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED" | "PENDING";
  itemsCount: number;
  customer: { name: string; email: string } | null;
};

export function OrderRow({
  order,
  onDeleteClick,
}: {
  order: Order;
  onDeleteClick: (status: "DELIVERED" | "CANCELLED", order: Order) => void;
  query?: string;
}) {
  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const paymentStyles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const statusStyles = {
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
    PENDING: "bg-orange-100 text-orange-700",
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition ">
      {/* Order ID */}
      <td className="py-3 px-4 font-medium">#{order.id.slice(0, 8)}</td>

      {/* Customer */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {order.customer?.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{order.customer?.name}</p>
            <p className="text-xs text-gray-500">{order.customer?.email}</p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-gray-600 text-sm">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>

      {/* Total */}
      <td className="py-3 px-4 font-medium">${order.total.toFixed(2)}</td>

      {/* Payment Status */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            paymentStyles[order.paymentStatus]
          }`}
        >
          {order.paymentStatus}
        </span>
      </td>

      {/* Order Status */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            statusStyles[order.status]
          }`}
        >
          {order.status}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <div ref={ref} className="relative inline-block text-left">
          <button
            onClick={() => setOpen(!open)}
            className="p-3 rounded-full hover:bg-gray-200 transition"
          >
            <FiMoreVertical className="text-gray-600" size={12} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow-lg z-50">
              <button
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
              >
                View details
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  onDeleteClick("DELIVERED", order);
                }}
                disabled={order.status === "DELIVERED"}
                // className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm"
                className={`w-full text-left px-4 py-2 text-sm 
  ${
    order.status === "DELIVERED" || order.status === "CANCELLED"
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-gray-50 cursor-pointer"
  }
`}
              >
                Mark as delivered
              </button>

              <button
                // onClick={() => setShowModal(true)}
                onClick={() => {
                  setOpen(false);
                  onDeleteClick("CANCELLED", order);
                }}
                disabled={order.status === "CANCELLED"}
                className={`w-full text-left px-4 py-2 text-sm  text-red-600
  ${
    order.status === "DELIVERED" || order.status === "CANCELLED"
      ? "opacity-50 cursor-not-allowed"
      : "hover:bg-gray-50 cursor-pointer"
  }
`}
              >
                Cancel order
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
