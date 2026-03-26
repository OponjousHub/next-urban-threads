"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { useState } from "react";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface Customer {
  name: string;
  email: string;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
  customer: Customer | null;
}

export default function OrderDetails({ order }: { order: Order }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    if (!localOrder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${localOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setLocalOrder({ ...localOrder, status: newStatus });
      toast.custom(
        <AdminToast
          type="success"
          title="Order updated"
          description={`Order status updated to ${newStatus}`}
        />,
        { duration: 6000 },
      );
    } catch (err) {
      console.error(err);
      toast.custom(
        <AdminToast
          type="error"
          title="Update failed"
          description="Could not update order status"
        />,
        { duration: 6000 },
      );
    } finally {
      setLoading(false);
    }
  }

  if (!localOrder) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Order #{localOrder.id}</h1>

      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-1/3">
          <h2 className="font-medium text-lg mb-2">Customer</h2>
          <p className="text-sm">{localOrder.customer?.name}</p>
          <p className="text-sm text-gray-500">{localOrder.customer?.email}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-4 w-full md:w-1/3">
          <h2 className="font-medium text-lg mb-2">Order Info</h2>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(localOrder.createdAt).toLocaleString()}
          </p>
          <p>
            <span className="font-medium">Status:</span> {localOrder.status}
          </p>
          <p>
            <span className="font-medium">Payment:</span>{" "}
            {localOrder.paymentStatus}
          </p>
          <p>
            <span className="font-medium">Total:</span> $
            {localOrder.totalAmount.toFixed(2)}
          </p>

          <div className="mt-3 flex gap-2 flex-wrap">
            {localOrder.status !== "DELIVERED" && (
              <button
                onClick={() => updateStatus("DELIVERED")}
                disabled={loading}
                className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
              >
                Mark as Delivered
              </button>
            )}
            {localOrder.status !== "CANCELLED" && (
              <button
                onClick={() => updateStatus("CANCELLED")}
                disabled={loading}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-medium text-lg mb-3">Items</h2>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 text-gray-600 uppercase text-xs">
              <th className="py-2 px-3 text-left">Item</th>
              <th className="py-2 px-3">Qty</th>
              <th className="py-2 px-3">Price</th>
              <th className="py-2 px-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {localOrder.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-2 px-3">{item.name}</td>
                <td className="py-2 px-3 text-center">{item.quantity}</td>
                <td className="py-2 px-3 text-right">
                  ${item.price.toFixed(2)}
                </td>
                <td className="py-2 px-3 text-right">
                  ${(item.price * item.quantity).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
