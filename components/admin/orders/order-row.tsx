"use client";

import { FiMoreVertical } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order, Action } from "@/types/order";
import { OrderStatus } from "@prisma/client";

type Props = {
  order: Order;
  onAction: (action: Action, order: Order) => void;
};

/* ---------------- STATUS FLOW ---------------- */

const STATUS_ORDER: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

/* ---------------- CONFIG ---------------- */

const STATUS_CONFIG: Partial<
  Record<OrderStatus, { title: string; message: string }>
> = {
  PENDING: {
    title: "Order placed",
    message: "Your order has been received",
  },
  PROCESSING: {
    title: "Processing",
    message: "We are preparing your order",
  },
  SHIPPED: {
    title: "Shipped",
    message: "Your package has left our warehouse",
  },
  OUT_FOR_DELIVERY: {
    title: "Out for delivery",
    message: "Your package is out for delivery and will arrive today",
  },
  DELIVERED: {
    title: "Delivered",
    message: "Your order has been delivered",
  },
  CANCELLED: {
    title: "Cancelled",
    message: "Order has been cancelled",
  },
};

/* ---------------- STYLES ---------------- */

const statusStyles: Partial<Record<OrderStatus, string>> = {
  PENDING: "bg-orange-100 text-orange-700",
  PROCESSING: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  OUT_FOR_DELIVERY: "bg-indigo-100 text-indigo-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

/* ---------------- COMPONENT ---------------- */

export function OrderRow({ order, onAction }: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  /* ---------------- STATUS POSITION ---------------- */

  const currentIndex = STATUS_ORDER.indexOf(order.status);

  const isPast = (status: OrderStatus) =>
    STATUS_ORDER.indexOf(status) <= currentIndex;

  /* ---------------- API ---------------- */

  const handleUpdateStatus = async (status: OrderStatus) => {
    const config = STATUS_CONFIG[status];
    if (!config) return;

    setSubmitting(true);

    try {
      await fetch(`/api/admin/orders/${order.id}/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          title: config.title,
          message: config.message,
          type: "STATUS_CHANGE",
        }),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const menuItem =
    "w-full text-left px-4 py-2 text-sm transition disabled:cursor-not-allowed";

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      <td className="py-3 px-4 font-medium">#{order.id.slice(0, 8)}</td>

      <td className="py-3 px-4">
        <p className="font-medium text-sm">{order.customer?.name}</p>
        <p className="text-xs text-gray-500">{order.customer?.email}</p>
      </td>

      <td className="py-3 px-4 text-gray-600 text-sm">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>

      <td className="py-3 px-4 font-medium">${order.total.toFixed(2)}</td>

      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            order.paymentStatus === "PAID"
              ? "bg-green-100 text-green-700"
              : order.paymentStatus === "FAILED"
                ? "bg-red-100 text-red-700"
                : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.paymentStatus}
        </span>
      </td>

      {/* STATUS BADGE */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            statusStyles[order.status]
          }`}
        >
          {order.status}
        </span>
      </td>

      {/* ACTIONS */}
      <td className="py-3 px-4 text-right">
        <div ref={ref} className="relative inline-block text-left">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <FiMoreVertical size={16} />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-xl z-50">
              {/* NAVIGATION */}
              <button
                onClick={() => router.push(`/admin/orders/${order.id}`)}
                className={menuItem}
              >
                View details
              </button>

              <button
                onClick={() =>
                  router.push(`/admin/orders/${order.id}/tracking`)
                }
                className={menuItem}
              >
                View tracking
              </button>

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

              <hr />

              {/* STATUS ACTIONS */}
              {STATUS_ORDER.map((status) => {
                const disabled = isPast(status) || submitting;

                return (
                  <button
                    key={status}
                    disabled={disabled}
                    onClick={() => {
                      setOpen(false);
                      onAction({ type: "status", value: status }, order);
                      handleUpdateStatus(status);
                    }}
                    className={`${menuItem} ${
                      disabled ? "opacity-40 bg-gray-50" : "hover:bg-gray-100"
                    }`}
                  >
                    {STATUS_CONFIG[status]?.title}
                  </button>
                );
              })}

              <hr />

              {/* CANCEL */}
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
