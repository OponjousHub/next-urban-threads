"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appToast } from "@/utils/appToast";

type Props = {
  refundId: string;
  onClose: () => void;
  onActionComplete: () => void;
};

export default function RefundReviewModal({
  refundId,
  onClose,
  onActionComplete,
}: Props) {
  const [refund, setRefund] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchRefund();
  }, [refundId]);

  async function fetchRefund() {
    try {
      const res = await fetch(`/api/admin/refunds/${refundId}`);
      const data = await res.json();
      setRefund(data);
    } catch {
      appToast.error("Error", "Failed to load refund");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(type: "approve" | "reject") {
    setActionLoading(true);

    const loadingToast = appToast.loading(
      type === "approve" ? "Approving..." : "Rejecting...",
    );

    try {
      await fetch(`/api/admin/refunds/${refundId}/${type}`, {
        method: "POST",
      });

      appToast.dismiss(loadingToast);

      appToast.success(
        "Success",
        type === "approve" ? "Refund approved" : "Refund rejected",
      );

      onActionComplete();
      onClose();
    } catch {
      appToast.dismiss(loadingToast);

      appToast.error(
        "Error",
        type === "approve"
          ? "Failed to approve refund"
          : "Failed to reject refund",
      );
    } finally {
      setActionLoading(false);
    }
  }

  const isProcessed =
    refund?.status === "REFUNDED" || refund?.status === "REJECTED";

  const isProcessing = refund?.status === "PROCESSING";

  return (
    <>
      {/* ✅ Title required by Radix */}
      <DialogHeader>
        <DialogTitle>Refund Review</DialogTitle>
      </DialogHeader>

      {loading ? (
        <p>Loading...</p>
      ) : !refund ? (
        <p>Refund not found</p>
      ) : (
        <>
          {/* ORDER INFO */}
          <div className="text-sm space-y-1">
            <p>
              <strong>Order:</strong> {refund.orderId}
            </p>
            <p>
              <strong>Status:</strong> {refund.status}
            </p>
            <p>
              <strong>Amount:</strong> ₦{refund.requestedAmount}
            </p>
          </div>

          {/* ITEMS */}
          <div>
            <h3 className="font-semibold mb-2">Items</h3>
            <div className="space-y-2">
              {refund.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex justify-between border p-2 rounded"
                >
                  <span>{item.product.name}</span>
                  <span>
                    {item.quantity} × ₦{item.priceAtPurchase}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* REASON */}
          <div>
            <h3 className="font-semibold">Reason</h3>
            <p className="text-sm text-gray-600">{refund.reason}</p>
            {refund.description && (
              <p className="text-sm mt-1">{refund.description}</p>
            )}
          </div>

          {/* ACTIONS */}
          <div className="flex gap-3 justify-end">
            {refund.status === "REQUESTED" && (
              <div className="flex gap-3 justify-end">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("reject")}
                  className="px-4 py-2 rounded-lg border text-red-600"
                >
                  Reject
                </button>

                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("approve")}
                  className="px-4 py-2 rounded-lg bg-black text-white"
                >
                  Approve Refund
                </button>
              </div>
            )}

            {refund.status === "PROCESSING" && (
              <div className="text-center py-3 text-yellow-600 font-medium">
                Refund Processing...
              </div>
            )}

            {refund.status === "REFUNDED" && (
              <div className="text-center py-3 text-green-600 font-medium">
                ✓ Refund Approved & Processed
              </div>
            )}

            {refund.status === "REJECTED" && (
              <div className="text-center py-3 text-red-600 font-medium">
                ✕ Refund Rejected
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}
