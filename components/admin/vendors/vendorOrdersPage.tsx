"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function VendorOrdersPage({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    const res = await fetch(`/api/admin/vendors/manage/${vendorId}/orders`);

    const data = await res.json();

    setOrders(data.data);
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <Link
        href={`/admin/vendors/manage/${vendorId}`}
        className="inline-flex items-center gap-2 mb-6"
      >
        <FaArrowLeft size={12} />
        Back to Vendor
      </Link>

      <h1 className="text-3xl font-bold mb-6">Vendor Orders</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr>
              <th className="p-4 text-left">Order #</th>

              <th className="p-4 text-left">Customer</th>

              <th className="p-4 text-left">Amount</th>

              <th className="p-4 text-left">Status</th>

              <th className="p-4 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order: any) => (
              <tr key={order.id} className="border-t">
                <td className="p-4">{order.id.slice(-8)}</td>

                <td className="p-4">{order.user?.name}</td>

                <td className="p-4">₦{order.total}</td>

                <td className="p-4">{order.status}</td>

                <td className="p-4">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
