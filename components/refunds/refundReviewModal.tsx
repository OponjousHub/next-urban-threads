"use client";

import { useEffect, useState } from "react";
import {
  FiAlertCircle,
  FiCheck,
  FiX,
  FiLoader,
  FiChevronDown,
} from "react-icons/fi";

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

  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const { tenant } = useTenant();

  useEffect(() => {
    fetchRefund();
  }, [refundId]);

  async function fetchRefund() {
    try {
      setLoading(true);

      const res = await fetch(`/api/admin/refunds/${refundId}`);

      if (!res.ok) {
        throw new Error("Failed to load refund");
      }

      const data = await res.json();

      setRefund(data);
    } catch (error) {
      console.error("Fetch refund error:", error);

      appToast.error("Error", "Failed to load refund request.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(type: "approve" | "reject" | "process") {
    if (type === "reject" && !rejectionReason.trim()) {
      appToast.warning(
        "Reason required",
        "Please provide a reason for rejecting this refund.",
      );

      return;
    }

    setActionLoading(true);

    const labels = {
      approve: "Approving...",
      reject: "Rejecting refund...",
      process: "Processing refund...",
    };

    const loadingToast = appToast.loading(labels[type]);

    try {
      const response = await fetch(`/api/admin/refunds/${refundId}/${type}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        ...(type === "reject"
          ? {
              body: JSON.stringify({
                reason: rejectionReason.trim(),
              }),
            }
          : {}),
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

      setIsRejecting(false);
      setRejectionReason("");

      await fetchRefund();

      onActionComplete();
    } catch (error) {
      appToast.dismiss(loadingToast);

      console.error(`Refund ${type} error:`, error);

      appToast.error(
        "Error",
        error instanceof Error ? error.message : `Failed to ${type} refund`,
      );
    } finally {
      setActionLoading(false);
    }
  }

  const handleCancelRejection = () => {
    if (actionLoading) return;

    setIsRejecting(false);
    setRejectionReason("");
  };

  const isProcessed =
    refund?.status === "REFUNDED" || refund?.status === "REJECTED";

  const isProcessing = refund?.status === "PROCESSING";

  return (
    <>
      {/* Header */}
      <DialogHeader className="mb-6">
        <DialogTitle className="text-xl font-semibold text-gray-900">
          Refund Review
        </DialogTitle>
      </DialogHeader>

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[240px] items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <FiLoader className="h-7 w-7 animate-spin text-gray-400" />

            <p className="text-sm text-gray-500">Loading refund details...</p>
          </div>
        </div>
      ) : !refund ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-center">
          <FiAlertCircle className="mx-auto mb-2 h-6 w-6 text-red-500" />

          <p className="font-medium text-red-700">Refund not found</p>

          <p className="mt-1 text-sm text-red-600">
            This refund request could not be loaded.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* ORDER INFO */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Order
                </p>

                <p className="mt-1 break-all text-sm font-semibold text-gray-900">
                  {refund.orderId}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                  Requested Amount
                </p>

                <p className="mt-1 text-sm font-semibold text-gray-900">
                  {tenant?.currency}
                  {refund.requestedAmount}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Requested Items
            </h3>

            <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200">
              {refund.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-4 bg-white px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {item.product.name}
                    </p>

                    <p className="mt-0.5 text-xs text-gray-500">
                      Quantity: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-medium text-gray-700">
                    {tenant?.currency}
                    {item.priceAtPurchase}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CUSTOMER REASON */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-gray-900">
              Customer's Reason
            </h3>

            <div className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-sm font-medium text-gray-800">
                {refund.reason}
              </p>

              {refund.description && (
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {refund.description}
                </p>
              )}
            </div>
          </div>

          {/* APPROVED */}
          {refund.status === "APPROVED" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex gap-3">
                <FiCheck className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />

                <div>
                  <p className="font-semibold text-blue-700">Refund Approved</p>

                  <p className="mt-1 text-sm leading-5 text-blue-600">
                    This refund has been approved but payment has not yet been
                    sent.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PROCESSING */}
          {refund.status === "PROCESSING" && (
            <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
              <div className="flex gap-3">
                <FiLoader className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-yellow-600" />

                <div>
                  <p className="font-semibold text-yellow-700">
                    Processing Refund
                  </p>

                  <p className="mt-1 text-sm leading-5 text-yellow-600">
                    Payment is currently being processed through the payment
                    gateway.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REFUNDED */}
          {refund.status === "REFUNDED" && (
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <div className="flex gap-3">
                <FiCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />

                <div>
                  <p className="font-semibold text-green-700">
                    Refund Completed
                  </p>

                  <p className="mt-1 text-sm leading-5 text-green-600">
                    The customer has been refunded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REJECTED */}
          {refund.status === "REJECTED" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <FiX className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                <div className="min-w-0">
                  <p className="font-semibold text-red-700">Refund Rejected</p>

                  <p className="mt-1 text-sm leading-5 text-red-600">
                    This refund request has been rejected.
                  </p>

                  {/* Rejection reason */}
                  {refund.rejectionReason && (
                    <div className="mt-3 rounded-lg border border-red-200 bg-white p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                        Admin's Reason
                      </p>

                      <p className="mt-1 text-sm leading-5 text-gray-700">
                        {refund.rejectionReason}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* CANCELLED */}
          {refund.status === "CANCELLED" && (
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="flex gap-3">
                <FiX className="mt-0.5 h-5 w-5 shrink-0 text-gray-500" />

                <div>
                  <p className="font-semibold text-gray-700">
                    Refund Cancelled
                  </p>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    The customer cancelled this refund request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REJECTION FORM */}
          {isRejecting && refund.status === "REQUESTED" && (
            <div className="rounded-xl border border-red-200 bg-red-50/60 p-4">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100">
                  <FiAlertCircle className="h-5 w-5 text-red-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900">
                    Reject Refund Request
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-gray-600">
                    Please provide a clear reason for rejecting this request.
                    This reason may be shown to the customer.
                  </p>
                </div>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={actionLoading}
                rows={4}
                maxLength={500}
                placeholder="Explain why this refund request is being rejected..."
                className="w-full resize-none rounded-xl border border-gray-300 bg-white px-3.5 py-3 text-sm text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <div className="mt-1.5 flex justify-end">
                <span className="text-xs text-gray-400">
                  {rejectionReason.length}/500
                </span>
              </div>

              <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancelRejection}
                  className="rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={() => handleAction("reject")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <FiX className="h-4 w-4" />
                      Reject Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          {!isProcessed && !isProcessing && !isRejecting && (
            <div className="flex flex-col-reverse gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:justify-end">
              {refund.status === "REQUESTED" && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setIsRejecting(true)}
                    className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiX className="h-4 w-4" />
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAction("approve")}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading ? (
                      <>
                        <FiLoader className="h-4 w-4 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="h-4 w-4" />
                        Approve Refund
                      </>
                    )}
                  </button>
                </>
              )}

              {refund.status === "APPROVED" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-4 w-4" />
                      Process Refund
                    </>
                  )}
                </button>
              )}

              {refund.status === "FAILED" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-4 w-4 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Retry Processing"
                  )}
                </button>
              )}
            </div>
          )}

          {/* Completed / terminal states */}
          {refund.status === "CANCELLED" && (
            <div className="border-t border-gray-100 pt-5 text-center text-sm font-medium text-gray-500">
              Customer cancelled this refund request.
            </div>
          )}

          {refund.status === "PROCESSING" && (
            <div className="border-t border-gray-100 pt-5 text-center text-sm font-medium text-yellow-600">
              Refund Processing...
            </div>
          )}

          {refund.status === "REFUNDED" && (
            <div className="border-t border-gray-100 pt-5 text-center text-sm font-medium text-green-600">
              ✓ Refund Approved & Processed
            </div>
          )}

          {refund.status === "REJECTED" && (
            <div className="border-t border-gray-100 pt-5 text-center text-sm font-medium text-red-600">
              ✕ Refund Rejected
            </div>
          )}
        </div>
      )}
    </>
  );
}
