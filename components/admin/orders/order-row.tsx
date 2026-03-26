"use client";

import { FiMoreVertical } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus, Order, Action } from "@/types/order";

type Props = {
  order: Order;
  query?: string;
  onAction: (action: Action, order: Order) => void;
};

export function OrderRow({ order, onAction }: Props) {
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

  const isDisabled = (target: OrderStatus) =>
    order.status === target || order.status === "CANCELLED";

  const menuItem =
    "w-full text-left px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="py-3 px-4 font-medium">#{order.id.slice(0, 8)}</td>

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

      <td className="py-3 px-4 text-gray-600 text-sm">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>

      <td className="py-3 px-4 font-medium">${order.total.toFixed(2)}</td>

      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            paymentStyles[order.paymentStatus]
          }`}
        >
          {order.paymentStatus}
        </span>
      </td>

      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            statusStyles[order.status]
          }`}
        >
          {order.status}
        </span>
      </td>

      <td className="py-3 px-4 text-right">
        <div ref={ref} className=" inline-block text-left z-50">
          <button
            onClick={() => setOpen(!open)}
            className="p-3 rounded-full hover:bg-gray-200 transition"
          >
            <FiMoreVertical size={14} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-xl z-1000 isolate">
              {/* View */}
              <button
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className={menuItem}
              >
                View details
              </button>

              {/* Status Updates */}
              <button
                disabled={isDisabled("PROCESSING")}
                onClick={() => {
                  setOpen(false);
                  onAction({ type: "status", value: "PROCESSING" }, order);
                }}
                className={menuItem}
              >
                Mark as processing
              </button>

              <button
                disabled={isDisabled("SHIPPED")}
                onClick={() => {
                  setOpen(false);
                  onAction({ type: "status", value: "SHIPPED" }, order);
                }}
                className={menuItem}
              >
                Mark as shipped
              </button>

              <button
                disabled={isDisabled("DELIVERED")}
                onClick={() => {
                  setOpen(false);
                  onAction({ type: "status", value: "DELIVERED" }, order);
                }}
                className={menuItem}
              >
                Mark as delivered
              </button>

              {/* Payment */}
              <button
                disabled={order.paymentStatus === "PAID"}
                onClick={() => {
                  setOpen(false);
                  onAction({ type: "payment", value: "PAID" }, order);
                }}
                className={menuItem}
              >
                Mark as paid
              </button>

              {/* Cancel */}
              <button
                disabled={order.status === "CANCELLED"}
                onClick={() => {
                  setOpen(false);
                  onAction({ type: "status", value: "CANCELLED" }, order);
                }}
                className={`${menuItem} text-red-600`}
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
