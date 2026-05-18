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

  image: string;

  variantImage?: string | null;

  variantColor?: string | null;

  variantSize?: string | null;
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
        <div className="flex items-center gap-3 m-4">
          <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
            {localOrder.customer?.name?.charAt(0)}
          </div>

          <div>
            <p className="font-semibold">{localOrder.customer?.name}</p>

            <p className="text-sm text-gray-500">
              {localOrder.customer?.email}
            </p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow p-4 w-full md:w-1/3">
          <h2 className="font-medium text-lg mb-2">Order Info</h2>
          <p>
            <span className="font-medium">Date:</span>{" "}
            {new Date(localOrder.createdAt).toLocaleString()}
          </p>
          <div>
            <p className="font-medium">
              Status:
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold
  ${
    localOrder.status === "DELIVERED"
      ? "bg-green-100 text-green-700"
      : localOrder.status === "PENDING"
        ? "bg-yellow-100 text-yellow-700"
        : localOrder.status === "CANCELLED"
          ? "bg-red-100 text-red-700"
          : "bg-blue-100 text-blue-700"
  }`}
              >
                {localOrder.status}
              </span>
            </p>
          </div>
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
            <button
              onClick={() => router.push(`/admin/orders/${order.id}/tracking`)}
              className="bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full"
            >
              Track Order
            </button>
          </div>{" "}
        </div>{" "}
      </div>

      {/* QUICK ACTIONS */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-medium text-lg mb-4">Quick Actions</h2>

        <div className="flex flex-wrap gap-3">
          {/* Copy Order ID */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(localOrder.id);

              toast.custom(
                <AdminToast
                  type="success"
                  title="Copied"
                  description="Order ID copied to clipboard"
                />,
                { duration: 4000 },
              );
            }}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
          >
            Copy Order ID
          </button>

          {/* Contact Customer */}
          <a
            href={`mailto:${localOrder.customer?.email}`}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
          >
            Contact Customer
          </a>

          {/* Print Invoice */}
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
          >
            Print Invoice
          </button>
        </div>
        {/* </div> */}
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-medium text-lg mb-3">Items</h2>

        <div className="space-y-4">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.variantImage || item.image}
                  alt={item.name}
                  className="h-20 w-20 rounded-xl object-cover"
                />

                <div>
                  <h3 className="font-semibold text-gray-900">{item.name}</h3>

                  {(item.variantColor || item.variantSize) && (
                    <p className="text-sm text-gray-500 mt-1">
                      <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                        {item.variantColor}
                      </span>

                      {item.variantColor && item.variantSize && " / "}
                      {item.variantSize}
                    </p>
                  )}

                  <p className="text-sm text-gray-400 mt-1">
                    Qty: {item.quantity}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="font-semibold">
                  ${(item.price * item.quantity).toFixed(2)}
                </p>

                <p className="text-sm text-gray-500">
                  ${item.price.toFixed(2)} each
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
