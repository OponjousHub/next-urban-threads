"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { StatusBadge } from "@/lib/status-badge";
import { FiCopy, FiCheck } from "react-icons/fi";
import { VendorDetailSkeleton } from "@/utils/adminSkeleton";

export default function VendorOrdersPage({ vendorId }: { vendorId: string }) {
  const [orders, setOrders] = useState([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    const res = await fetch(`/api/admin/vendors/manage/${vendorId}/orders`);

    const data = await res.json();

    setOrders(data.data);
    setLoading(false);
  }

  async function handleCopy(id: string) {
    await navigator.clipboard.writeText(id);

    setCopiedId(id);

    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  }

  if (loading) {
    return <VendorDetailSkeleton />;
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
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <span title={order.id} className="font-mono text-sm">
                      {order.id.slice(-8)}...
                    </span>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(order.id);
                      }}
                      className={`
    inline-flex items-center gap-1
    text-xs font-medium transition-colors
    ${
      copiedId === order.id
        ? "text-green-600"
        : "text-muted-foreground hover:text-foreground"
    }
  `}
                    >
                      {copiedId === order.id ? (
                        <>
                          <FiCheck size={12} />
                          Copied
                        </>
                      ) : (
                        <>
                          <FiCopy size={12} />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </td>
                <td className="p-4">{order.user?.name}</td>

                <td className="p-4">₦{order.totalAmount}</td>

                <td className="p-4">
                  <StatusBadge status={order.status} />
                </td>

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
