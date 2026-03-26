"use client";

import { OrderRow } from "./order-row";
import { Order } from "@/types/order";

import { ConfirmDeleteModal } from "@/app/admin/confirmDeleteModal";
import { useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { useRouter } from "next/navigation";

type Action =
  | {
      type: "status";
      value: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    }
  | { type: "payment"; value: "PAID" };

type SelectedOrder = {
  action: Action;
  order: Order;
} | null;

export default function OrdersTable({
  orders,
  query,
}: {
  orders: Order[];
  query?: string;
}) {
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<SelectedOrder>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 🔥 Unified update function
  async function updateOrder(action: Action, orderId: string) {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(action.type === "status" && { status: action.value }),
          ...(action.type === "payment" && {
            paymentStatus: action.value,
          }),
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
                  query={query}
                  onAction={(action, order) => {
                    // 🚨 Only CANCEL needs confirmation
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
      </div>

      {/* ✅ Modal ONLY for destructive action */}
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
