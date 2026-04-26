"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { DialogTitle } from "@/components/ui/dialog";

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
    } catch (err) {
      toast.error("Failed to load refund");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(type: "approve" | "reject") {
    setActionLoading(true);

    const toastId = toast.loading(
      type === "approve" ? "Approving..." : "Rejecting...",
    );

    try {
      await fetch(`/api/refunds/${refundId}/${type}`, {
        method: "POST",
      });

      toast.success(
        type === "approve" ? "Refund approved" : "Refund rejected",
        { id: toastId },
      );

      onActionComplete();
      onClose();
    } catch {
      toast.error("Action failed", { id: toastId });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!refund) {
    return <p>Refund not found</p>;
  }

  return (
    <div className="space-y-6">
      <DialogTitle className="text-xl font-semibold">Refund Review</DialogTitle>

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
    </div>
  );
}
