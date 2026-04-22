"use client";

import { OrderRow } from "./order-row";
import { Order } from "@/types/order";
import { ConfirmDeleteModal } from "@/app/admin/confirmDeleteModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { useRouter } from "next/navigation";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export type Action =
  | { type: "status"; value: OrderStatus }
  | { type: "payment"; value: PaymentStatus };

type SelectedOrder = {
  action: Action;
  order: Order;
} | null;

type OrdersTableProps = {
  orders: Order[];
  query?: string;
  currentPage: number;
  totalPages: number;
  totalOrders: number;
};

export default function OrdersTable({
  orders,
  query,
  currentPage,
  totalPages,
  totalOrders,
}: OrdersTableProps) {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Unified update function
  async function updateOrder(action: Action, orderId: string) {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(action.type === "status" && { status: action.value }),
          ...(action.type === "payment" && { paymentStatus: action.value }),
        }),
      });

      if (!res.ok) throw new Error();

      toast.custom(
        <AdminToast
          type="success"
          title="Order updated"
          description={
            action.type === "payment"
              ? "Payment marked as paid"
              : `Order marked as ${action.value.toLowerCase()}`
          }
        />,
        { duration: 4000 },
      );

      router.refresh();
    } catch (err: any) {
      toast.custom(
        <AdminToast
          type="error"
          title="Update failed"
          description={err?.message || "Could not update order"}
        />,
        { duration: 4000 },
      );
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  }

  // Navigate while preserving filters
  function goToPage(page: number) {
    const params = new URLSearchParams(window.location.search);
    params.set("page", page.toString());
    router.push(`/admin/orders?${params.toString()}`);
  }

  const base =
    "px-3 py-1.5 text-sm rounded-lg border transition disabled:opacity-40 disabled:cursor-not-allowed";

  return (
    <>
      <div className="bg-white rounded-2xl border shadow-sm overflow-visible">
        <table className="w-full text-sm">
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
              orders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
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
                />
              ))
            )}
          </tbody>
        </table>

        {/* Pagination & Page Info */}
        <div className="border-t px-4 py-10 bg-gray-50 rounded-b-2xl">
          <div className="flex justify-center items-center flex-wrap gap-3">
            <div className="flex justify-between items-center mt-4 flex-wrap gap-2">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-medium">
                  {(currentPage - 1) * 10 + 1}
                </span>
                –
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
      </div>

      {/* Confirm Cancel Modal */}
      {selectedOrder && (
        <ConfirmDeleteModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            if (!selectedOrder) return;
            updateOrder(selectedOrder.action, selectedOrder.order.id);
          }}
          loading={loading}
          loadingText="Cancelling..."
          action="Cancel order"
          title="Cancel Order"
          description="Are you sure you want to cancel this order?"
        />
      )}
    </>
  );
}
