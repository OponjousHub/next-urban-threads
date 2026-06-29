"use client";

import { OrderRow } from "./order-row";
import { Order } from "@/types/order";
import ConfirmationModal from "../modals/ConfirmationModal";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import {
  buildOrderActions,
  Action,
  STATUS_CONFIG,
} from "@/app/lib/order/buildOrderActions";
import { appToast } from "@/utils/appToast";

type SelectedOrderState = {
  action: Action;
  order: OrderSelected;
};

type OrderSelected = {
  id: string;
  createdAt: Date;
  total: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  itemsCount: number;
  customer: { name: string; email: string } | null;
};

type OrdersTableProps = {
  orders: Order[];
  query?: string;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
  basePath: string;
};

export default function OrdersTable({
  orders,
  query,
  currentPage,
  totalPages,
  totalOrders,
  basePath,
}: OrdersTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrderState | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);
  const [orderSelected, setOrderSelected] = useState<OrderSelected | null>(
    null,
  );
  const [showActionsSheet, setShowActionsSheet] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Order Action
  const orderActions = orderSelected
    ? buildOrderActions({
        order: orderSelected,
        basePath,

        onViewDetails: () => {
          router.push(`${basePath}/${orderSelected.id}`);
        },

        onViewTracking: () => {
          router.push(`${basePath}/${orderSelected.id}/tracking`);
        },

        onPaymentUpdate: () => {
          updateOrder(
            {
              type: "payment",
              value: "PAID",
            },
            orderSelected.id,
          );
        },

        onStatusUpdate: (status) => {
          updateOrder(
            {
              type: "status",
              value: status,
            },
            orderSelected.id,
          );
        },

        onCancel: () => {
          setSelectedOrder({
            action: {
              type: "status",
              value: "CANCELLED",
            },
            order: orderSelected,
          });

          setShowModal(true);
        },
      })
    : [];

  /* ---------------- API ---------------- */

  // Unified update function
  async function updateOrder(action: Action, orderId: string) {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(action.type === "status" && {
            status: action.value,
          }),
          ...(action.type === "payment" && {
            paymentStatus: action.value,
          }),
        }),
      });

      if (!res.ok) throw new Error();

      // CREATE TRACKING EVENT
      if (action.type === "status") {
        const config = STATUS_CONFIG[action.value];

        if (config) {
          await fetch(`/api/admin/orders/${orderId}/tracking`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: action.value,
              title: config.title,
              message: config.message,
              type: "STATUS_CHANGE",
            }),
          });
        }
      }

      appToast.success(
        "Order updated",
        action.type === "payment"
          ? "Payment marked as paid"
          : `Order marked as ${action.value.toLowerCase()}`,
      );

      router.refresh();
    } catch (err: any) {
      appToast.error("Update failed", err?.message || "Could not update order");
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }
  //Callback function for opening sheet for mobile
  const handleOpenActions = (order: Order) => {
    setOrderSelected(order);
    setShowActionsSheet(true);
  };

  // Navigate while preserving filters
  function goToPage(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`${basePath}?${params.toString()}`);
  }

  const base =
    "px-3 py-1.5 text-sm rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm ">
        <div className="overflow-x-auto md:overflow-visible">
          {" "}
          <table className=" w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
              <tr className="text-left text-lg">
                <th className="py-3 px-4">Order</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-500">
                    No orders found
                  </td>
                </tr>
              ) : (
                orders.map((order, index) => (
                  <OrderRow
                    key={order.id}
                    order={order}
                    rowIndex={index}
                    totalRows={orders.length}
                    onOpenActions={() => handleOpenActions(order)}
                    onAction={(action, order) => {
                      // Only CANCEL needs confirmation
                      if (
                        action.type === "status" &&
                        action.value === "CANCELLED"
                      ) {
                        setSelectedOrder({ action, order });
                        setShowModal(true);
                      } else {
                        updateOrder(action, order.id);
                      }
                    }}
                    basePath={basePath}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* Pagination & Page Info */}
      <div className="border-t px-4 py-10 bg-gray-50 rounded-b-2xl">
        <div className="flex justify-center items-center flex-wrap gap-3">
          <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
            <p className="text-sm text-gray-600">
              Showing{" "}
              <span className="font-medium">{(currentPage - 1) * 10 + 1}</span>–
              <span className="font-medium">
                {Math.min(currentPage * 10, totalOrders)}
              </span>{" "}
              of <span className="font-medium">{totalOrders}</span>
            </p>

            <div className="flex items-center gap-1">
              {/* Previous */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className={`${base} bg-white hover:bg-gray-100`}
              >
                ←
              </button>

              {/* Page Numbers (limit visible pages 👇 important) */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .slice(Math.max(0, currentPage - 3), currentPage + 2)
                .map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`${base} ${
                      p === currentPage
                        ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow-sm"
                        : "bg-white hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                ))}

              {/* Next */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`${base} bg-white hover:bg-gray-100`}
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm Cancel Modal */}
      {selectedOrder && (
        <ConfirmationModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            if (!selectedOrder) return;
            updateOrder(selectedOrder.action, selectedOrder.order.id);
          }}
          loading={loading}
          loadingText="Cancelling..."
          title="Cancel order"
          description="Are you sure you want to cancel this order? This action cannot be undone."
          action="Cancel Order"
          variant="danger"
        />
      )}

      {showActionsSheet && orderSelected && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowActionsSheet(false)}
          />

          {/* Sheet */}
          <div className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
            <div className="rounded-t-3xl bg-white shadow-2xl">
              {/* Handle */}
              <div className="flex justify-center py-3">
                <div className="h-1.5 w-12 rounded-full bg-gray-300" />
              </div>

              {/* Header */}
              <div className="border-b px-5 pb-4">
                <h3 className="text-lg font-semibold">Order Actions</h3>

                <p className="mt-1 text-sm text-gray-500">
                  Order #{orderSelected.id.slice(-8)}
                </p>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                {orderActions.map((item) => (
                  <button
                    key={item.label}
                    disabled={item.disabled}
                    onClick={() => {
                      item.action();

                      if (!item.disabled) {
                        setShowActionsSheet(false);
                      }
                    }}
                    className={`
        flex w-full items-center justify-between
        rounded-xl border px-4 py-3 text-left transition

        ${
          item.disabled
            ? "cursor-not-allowed bg-gray-50 text-gray-400"
            : item.danger
              ? "border-red-200 text-red-600 hover:bg-red-50"
              : "hover:bg-gray-50"
        }
      `}
                  >
                    <span>{item.label}</span>

                    {!item.disabled && <span className="text-gray-400">›</span>}
                  </button>
                ))}
              </div>

              {/* Footer */}
              <div className="border-t p-4">
                <button
                  onClick={() => setShowActionsSheet(false)}
                  className="w-full rounded-xl border py-3 font-medium hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
