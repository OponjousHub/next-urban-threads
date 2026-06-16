"use client";

import { FiMoreVertical } from "react-icons/fi";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Order } from "@/types/order";
import { OrderStatus } from "@prisma/client";
import { useTenant } from "@/store/tenant-provider-context";
import { StatusBadge } from "@/lib/status-badge";
import {
  buildOrderActions,
  Action,
  STATUS_CONFIG,
} from "@/app/lib/order/buildOrderActions";

type Props = {
  order: Order;
  onAction: (action: Action, order: Order) => void;
  rowIndex: number;
  totalRows: number;
  basePath: string;
  onOpenActions: (order: Order) => void;
};

export function OrderRow({
  order,
  rowIndex,
  totalRows,
  onOpenActions,
  onAction,
  basePath,
}: Props) {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [menuPosition, setMenuPosition] = useState({
    top: 0,
    left: 0,
  });
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { tenant } = useTenant();

  const handleOpenMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();

    const menuHeight = 220;

    setMenuPosition({
      left: rect.right - 190,
      top: rect.bottom + 8,
    });

    setMenuPosition({
      left: rect.right - 190,
      top: rect.top - 8,
    });

    setOpen(true);
  };

  const actions = buildOrderActions({
    order,
    basePath,

    onViewDetails: () => {
      router.push(`${basePath}/${order.id}`);
    },

    onViewTracking: () => {
      router.push(`${basePath}/${order.id}/tracking`);
    },

    onPaymentUpdate: () => {
      onAction(
        {
          type: "payment",
          value: "PAID",
        },
        order,
      );
    },

    onStatusUpdate: (status) => {
      onAction(
        {
          type: "status",
          value: status,
        },
        order,
      );
    },

    onCancel: () => {
      onAction(
        {
          type: "status",
          value: "CANCELLED",
        },
        order,
      );
    },
  });

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

  // const currentIndex = STATUS_ORDER.indexOf(order.status);

  // const isPast = (status: OrderStatus) =>
  //   STATUS_ORDER.indexOf(status) <= currentIndex;

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

  // Open the action menu upwards
  const openUpward = rowIndex >= totalRows - 2;

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

      <td className="py-3 px-4 font-medium">
        {tenant.currency}
        {order.total.toFixed(2)}
      </td>

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
        <StatusBadge status={order.status} />{" "}
      </td>

      {/* ACTIONS */}
      <td className="py-3 px-4 text-right">
        <div ref={ref} className="relative inline-block text-left z-[9999]">
          <button
            onClick={handleOpenMenu}
            className="hidden md:block p-2 rounded-full hover:bg-gray-200"
          >
            {" "}
            <FiMoreVertical size={16} />
          </button>
          <button
            onClick={() => onOpenActions(order)}
            className="md:hidden p-2 rounded-full hover:bg-gray-200"
          >
            <FiMoreVertical size={16} />
          </button>

          {open && (
            <div
              className={`fixed z-[9999] w-56 rounded-xl border bg-white shadow-xl ${
                openUpward ? "-translate-y-full" : ""
              }`}
              style={{
                top: menuPosition.top,
                left: menuPosition.left,
              }}
            >
              {actions.map((item) => (
                <button
                  key={item.label}
                  disabled={item.disabled}
                  onClick={item.action}
                  className={`
      ${menuItem}
      ${item.disabled ? "opacity-40 cursor-not-allowed" : ""}
      ${item.danger ? "text-red-600" : ""}
    `}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}
