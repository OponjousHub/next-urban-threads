"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/lib/status-badge";

type Refund = {
  id: string;
  orderId: string;
  status: string;
  requestedAmount: number;
  createdAt: string;
  reason: string;
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    try {
      const res = await fetch("/api/admin/refunds");
      const data = await res.json();
      setRefunds(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <p className="p-6">Loading refunds...</p>;
  }

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Refund Requests</h1>

      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
            <tr>
              <th className="p-3 text-left">Order</th>
              <th className="p-3 text-left">Reason</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {refunds.map((r) => (
              <tr
                key={r.id}
                className="border-t hover:bg-gray-50 cursor-pointer"
              >
                <td className="p-3">{r.orderId}</td>
                <td className="p-3">{r.reason}</td>
                <td className="p-3 font-medium">₦{r.requestedAmount}</td>
                <td className="p-3">
                  <StatusBadge status={r.status} />
                </td>
                <td className="p-3">
                  {new Date(r.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
