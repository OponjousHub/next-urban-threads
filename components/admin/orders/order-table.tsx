"use client";

import { OrderRow } from "./order-row";
import { Order } from "./order-row";
import { ConfirmDeleteModal } from "@/app/admin/confirmDeleteModal";
import { useState } from "react";

type SelectedOrder = {
  status: "DELIVERED" | "CANCELLED";
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

  // Update Function
  async function updateOrderStatus(status: string, orderId: string) {
    try {
      setLoading(true);

      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error();

      // later we’ll refresh table
    } catch (err) {
      console.error(err);
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
            <tr className=" text-left text-lg ">
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
                  onDeleteClick={(
                    status: "DELIVERED" | "CANCELLED",
                    order: any,
                  ) => {
                    setSelectedOrder({ status, order });
                    setShowModal(true);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedOrder && (
        <ConfirmDeleteModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() =>
            updateOrderStatus(selectedOrder.status, selectedOrder.order.id)
          }
          loading={loading}
          title={
            selectedOrder.status === "CANCELLED"
              ? "Cancel Order"
              : "Mark as delivered"
          }
          description={`Are you sure you want to ${
            selectedOrder.status === "CANCELLED"
              ? "cancel this order?"
              : "mark this order as delivered?"
          }`}
        />
      )}
    </>
  );
}
