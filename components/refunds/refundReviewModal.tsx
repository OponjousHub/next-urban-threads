"use client";

import { useEffect, useState } from "react";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appToast } from "@/utils/appToast";
import { useTenant } from "@/store/tenant-provider-context";

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

  const { tenant } = useTenant();

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

  async function handleAction(type: "approve" | "reject" | "process") {
    setActionLoading(true);

    const labels = {
      approve: "Approving...",
      reject: "Rejecting...",
      process: "Processing refund...",
    };

    const loadingToast = appToast.loading(labels[type]);

    try {
      console.log("THIS IS THE TYPE:", type);
      const response = await fetch(`/api/admin/refunds/${refundId}/${type}`, {
        method: "POST",
      });

      const data = await response.json();

      appToast.dismiss(loadingToast);

      if (!response.ok) {
        throw new Error(
          data?.message || data?.error || `Failed to ${type} refund`,
        );
      }

      appToast.success(
        "Success",
        type === "approve"
          ? "Refund approved"
          : type === "process"
            ? "Refund processed"
            : "Refund rejected",
      );

      await fetchRefund(); // refresh modal

      onActionComplete();
    } catch (error) {
      appToast.dismiss(loadingToast);

      console.error(`Refund ${type} error:`, error);

      appToast.error(
        "Error",
        error instanceof Error
          ? error.message
          : type === "approve"
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
              <strong>Amount:</strong> {tenant.currency}
              {refund.requestedAmount}
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
                    {item.quantity} × {tenant.currency}
                    {item.priceAtPurchase}
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

          {/* STATUS CARD */}

          {refund.status === "APPROVED" && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 mb-4">
              <p className="font-semibold text-blue-700">Refund Approved</p>

              <p className="mt-1 text-sm text-blue-600">
                This refund has been approved but payment has not yet been sent.
              </p>
            </div>
          )}

          {refund.status === "PROCESSING" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 mb-4">
              <p className="font-semibold text-yellow-700">Processing Refund</p>

              <p className="mt-1 text-sm text-yellow-600">
                Payment is currently being processed through the payment
                gateway.
              </p>
            </div>
          )}

          {refund.status === "REFUNDED" && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 mb-4">
              <p className="font-semibold text-green-700">Refund Completed</p>

              <p className="mt-1 text-sm text-green-600">
                The customer has been refunded successfully.
              </p>
            </div>
          )}

          {refund.status === "REJECTED" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-4">
              <p className="font-semibold text-red-700">Refund Rejected</p>

              <p className="mt-1 text-sm text-red-600">
                This refund request has been rejected.
              </p>
            </div>
          )}

          {refund.status === "CANCELLED" && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 mb-4">
              <p className="font-semibold text-gray-700">Refund Cancelled</p>

              <p className="mt-1 text-sm text-gray-600">
                The customer cancelled this refund request.
              </p>
            </div>
          )}

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

            {refund.status === "APPROVED" && (
              <div className="flex justify-end">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                >
                  Process Refund
                </button>
              </div>
            )}

            {refund.status === "FAILED" && (
              <div className="flex justify-end">
                <button
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                >
                  Retry Processing
                </button>
              </div>
            )}

            {refund.status === "CANCELLED" && (
              <div className="text-center py-3 text-gray-600 font-medium">
                Customer cancelled this refund request.
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
