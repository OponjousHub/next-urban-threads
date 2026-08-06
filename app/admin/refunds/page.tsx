"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/lib/status-badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RefundReviewModal from "@/components/refunds/refundReviewModal";
import { useTenant } from "@/store/tenant-provider-context";
import RefundKpis from "@/components/admin/refunds/refundKpis";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

type Refund = {
  id: string;
  orderId: string;
  status: string;
  requestedAmount: number;
  createdAt: string;
  reason: string;
};

type RefundResponse = {
  refunds: Refund[];
  totalRefunds: number;
  requestedRefunds: number;
  approvedRefunds: number;
  processingRefunds: number;
  refundedRefunds: number;
  failedRefunds: number;
};

type RefundKpisState = {
  total: number;
  requested: number;
  approved: number;
  processing: number;
  refunded: number;
  failed: number;
};

export default function RefundsPage() {
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRefund, setSelectedRefund] = useState<string | null>(null);

  const [kpis, setKpis] = useState<RefundKpisState>({
    total: 0,
    requested: 0,
    approved: 0,
    processing: 0,
    refunded: 0,
    failed: 0,
  });

  const { tenant } = useTenant();

  useEffect(() => {
    fetchRefunds();
  }, []);

  async function fetchRefunds() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/refunds", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch refunds");
      }

      const data: RefundResponse = await res.json();

      setRefunds(data.refunds);

      setKpis({
        total: data.totalRefunds,
        requested: data.requestedRefunds,
        approved: data.approvedRefunds,
        processing: data.processingRefunds,
        refunded: data.refundedRefunds,
        failed: data.failedRefunds,
      });
    } catch (err) {
      console.error("Failed to load refunds:", err);
    } finally {
      setLoading(false);
    }
  }

  console.log("REFUNDSSS", refunds);
  console.log("REFUND KPIS", kpis);

  if (loading) {
    return <p className="p-6">Loading refunds...</p>;
  }

  return (
    <>
      <AdminHeaderUI
        title="Products"
        subtitle="Manage your inventory and product listings"
      />
      <main className="p-6">
        <h1 className="mb-6 text-2xl font-bold">Refund Requests</h1>

        {/* Refund KPIs */}
        <RefundKpis
          total={kpis.total}
          requested={kpis.requested}
          approved={kpis.approved}
          processing={kpis.processing}
          refunded={kpis.refunded}
          failed={kpis.failed}
        />
        <div className="overflow-hidden rounded-xl border bg-white">
          {/* Refund Table */}
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="p-3 text-left">Order</th>
                <th className="p-3 text-left">Reason</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {refunds.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-8 text-center text-sm text-gray-500"
                  >
                    No refund requests found.
                  </td>
                </tr>
              ) : (
                refunds.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => setSelectedRefund(r.id)}
                    className="cursor-pointer border-t hover:bg-gray-50"
                  >
                    <td className="p-3">{r.orderId}</td>

                    <td className="p-3">{r.reason}</td>

                    <td className="p-3 font-medium">
                      {tenant.currency}
                      {Number(r.requestedAmount).toFixed(2)}
                    </td>

                    <td className="p-3">
                      <StatusBadge status={r.status} />
                    </td>

                    <td className="p-3">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Refund Review Modal */}
          <Dialog
            open={!!selectedRefund}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedRefund(null);
              }
            }}
          >
            <DialogContent className="max-w-3xl">
              {selectedRefund && (
                <RefundReviewModal
                  refundId={selectedRefund}
                  onClose={() => setSelectedRefund(null)}
                  onActionComplete={fetchRefunds}
                />
              )}
            </DialogContent>
          </Dialog>
        </div>
      </main>
    </>
  );
}
