"use client";

import { useEffect, useState } from "react";
import { FiAlertCircle, FiCheck, FiX, FiLoader } from "react-icons/fi";

import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { appToast } from "@/utils/appToast";
import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  refundId: string;
  onClose: () => void;
  onActionComplete: () => void;
};

type RefundOption = "ITEMS_ONLY" | "ITEMS_PLUS_SHIPPING";

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

  const [refundOption, setRefundOption] = useState<RefundOption>("ITEMS_ONLY");

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
          : type === "process"
            ? {
                body: JSON.stringify({
                  refundOption,
                }),
              }
            : {}),
      });

      const data = await response.json().catch(() => null);

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

  /*
   * ---------------------------------------------------------
   * REFUND AMOUNT CALCULATIONS
   * ---------------------------------------------------------
   */

  const itemRefundAmount = Number(
    refund?.approvedAmount ?? refund?.requestedAmount ?? 0,
  );

  const shippingCost = Number(refund?.order?.shippingCost ?? 0);

  const totalRefundAmount =
    refundOption === "ITEMS_PLUS_SHIPPING"
      ? itemRefundAmount + shippingCost
      : itemRefundAmount;

  const currency = tenant?.currency ?? refund?.currency ?? "";

  return (
    <>
      {/* HEADER */}
      <DialogHeader className="mb-3">
        <DialogTitle className="text-lg font-semibold text-gray-900">
          Refund Review
        </DialogTitle>
      </DialogHeader>

      {/* LOADING */}
      {loading ? (
        <div className="flex min-h-[180px] items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <FiLoader className="h-6 w-6 animate-spin text-gray-400" />
            <p className="text-xs text-gray-500">Loading refund details...</p>
          </div>
        </div>
      ) : !refund ? (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center">
          <FiAlertCircle className="mx-auto mb-1.5 h-5 w-5 text-red-500" />
          <p className="text-sm font-medium text-red-700">Refund not found</p>
          <p className="mt-0.5 text-xs text-red-600">
            This refund request could not be loaded.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* ORDER INFO */}
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Order
                </p>
                <p className="mt-0.5 truncate text-xs font-semibold text-gray-900">
                  {refund.orderId}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-500">
                  Requested Amount
                </p>
                <p className="mt-0.5 text-xs font-semibold text-gray-900">
                  {currency}
                  {Number(refund.requestedAmount ?? 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* ITEMS */}
          <div>
            <h3 className="mb-1.5 text-xs font-semibold text-gray-900">
              Requested Items
            </h3>

            <div className="divide-y divide-gray-100 overflow-hidden rounded-lg border border-gray-200">
              {refund.items.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between gap-3 bg-white px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-gray-900">
                      {item.product.name}
                    </p>

                    <p className="mt-0.5 text-[11px] text-gray-500">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-xs font-medium text-gray-700">
                    {currency}
                    {Number(item.priceAtPurchase ?? 0).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CUSTOMER REASON */}
          <div>
            <h3 className="mb-1.5 text-xs font-semibold text-gray-900">
              Customer&apos;s Reason
            </h3>

            <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <p className="text-xs font-medium text-gray-800">
                {refund.reason}
              </p>

              {refund.description && (
                <p className="mt-1 text-xs leading-4 text-gray-600">
                  {refund.description}
                </p>
              )}
            </div>
          </div>

          {/* REFUND AMOUNT SELECTION */}
          {(refund.status === "APPROVED" || refund.status === "FAILED") && (
            <div className="rounded-lg border border-gray-200 bg-white p-3">
              <div className="mb-2.5">
                <h3 className="text-xs font-semibold text-gray-900">
                  Refund Amount
                </h3>

                <p className="mt-0.5 text-[11px] leading-4 text-gray-500">
                  Choose item cost only or item cost plus the original shipping.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {/* ITEM COST ONLY */}
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 transition ${
                    refundOption === "ITEMS_ONLY"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundOption"
                    value="ITEMS_ONLY"
                    checked={refundOption === "ITEMS_ONLY"}
                    onChange={() => setRefundOption("ITEMS_ONLY")}
                    disabled={actionLoading}
                    className="mt-0.5 h-3.5 w-3.5"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900">
                        Item cost only
                      </p>

                      <p className="shrink-0 text-xs font-bold text-gray-900">
                        {currency}
                        {itemRefundAmount.toFixed(2)}
                      </p>
                    </div>

                    <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                      Shipping will not be refunded.
                    </p>
                  </div>
                </label>

                {/* ITEM COST + SHIPPING */}
                <label
                  className={`flex cursor-pointer items-start gap-2 rounded-lg border px-3 py-2.5 transition ${
                    refundOption === "ITEMS_PLUS_SHIPPING"
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="refundOption"
                    value="ITEMS_PLUS_SHIPPING"
                    checked={refundOption === "ITEMS_PLUS_SHIPPING"}
                    onChange={() => setRefundOption("ITEMS_PLUS_SHIPPING")}
                    disabled={actionLoading}
                    className="mt-0.5 h-3.5 w-3.5"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-semibold text-gray-900">
                        Item + shipping
                      </p>

                      <p className="shrink-0 text-xs font-bold text-gray-900">
                        {currency}
                        {(itemRefundAmount + shippingCost).toFixed(2)}
                      </p>
                    </div>

                    <p className="mt-0.5 text-[10px] leading-4 text-gray-500">
                      Includes original shipping cost.
                    </p>
                  </div>
                </label>
              </div>

              {/* FINAL REFUND TOTAL */}
              <div className="mt-2.5 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-green-700">
                      Total refund
                    </p>

                    <p className="mt-0.5 text-[10px] text-green-600">
                      Amount sent to payment provider
                    </p>
                  </div>

                  <p className="text-lg font-bold text-green-700">
                    {currency}
                    {totalRefundAmount.toFixed(2)}
                  </p>
                </div>

                <div className="mt-2 flex items-center justify-between border-t border-green-200 pt-2 text-[10px] text-green-700">
                  <span>
                    Items: {currency}
                    {itemRefundAmount.toFixed(2)}
                  </span>

                  <span>
                    Shipping: {currency}
                    {(refundOption === "ITEMS_PLUS_SHIPPING"
                      ? shippingCost
                      : 0
                    ).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PROCESSING */}
          {refund.status === "PROCESSING" && (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <FiLoader className="h-4 w-4 shrink-0 animate-spin text-yellow-600" />

                <div>
                  <p className="text-xs font-semibold text-yellow-700">
                    Processing Refund
                  </p>

                  <p className="mt-0.5 text-[11px] text-yellow-600">
                    Payment is currently being processed through the payment
                    gateway.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REFUNDED */}
          {refund.status === "REFUNDED" && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <FiCheck className="h-4 w-4 shrink-0 text-green-600" />

                <div>
                  <p className="text-xs font-semibold text-green-700">
                    Refund Completed
                  </p>

                  <p className="mt-0.5 text-[11px] text-green-600">
                    The customer has been refunded successfully.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REJECTED */}
          {refund.status === "REJECTED" && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5">
              <div className="flex gap-2.5">
                <FiX className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-red-700">
                    Refund Rejected
                  </p>

                  <p className="mt-0.5 text-[11px] text-red-600">
                    This refund request has been rejected.
                  </p>

                  {refund.rejectionReason && (
                    <div className="mt-2 rounded-md border border-red-200 bg-white px-2.5 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                        Admin&apos;s Reason
                      </p>

                      <p className="mt-0.5 text-[11px] leading-4 text-gray-700">
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
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
              <div className="flex items-center gap-2.5">
                <FiX className="h-4 w-4 shrink-0 text-gray-500" />

                <div>
                  <p className="text-xs font-semibold text-gray-700">
                    Refund Cancelled
                  </p>

                  <p className="mt-0.5 text-[11px] text-gray-600">
                    The customer cancelled this refund request.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* REJECTION FORM */}
          {isRejecting && refund.status === "REQUESTED" && (
            <div className="rounded-lg border border-red-200 bg-red-50/60 p-3">
              <div className="mb-2.5 flex items-start gap-2.5">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-red-100">
                  <FiAlertCircle className="h-4 w-4 text-red-600" />
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-gray-900">
                    Reject Refund Request
                  </h3>

                  <p className="mt-0.5 text-[11px] leading-4 text-gray-600">
                    Provide a clear reason for rejecting this request.
                  </p>
                </div>
              </div>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                disabled={actionLoading}
                rows={3}
                maxLength={500}
                placeholder="Explain why this refund request is being rejected..."
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-700 outline-none transition-all placeholder:text-gray-400 focus:border-red-400 focus:ring-2 focus:ring-red-100 disabled:cursor-not-allowed disabled:bg-gray-100"
              />

              <div className="mt-1 flex justify-end">
                <span className="text-[10px] text-gray-400">
                  {rejectionReason.length}/500
                </span>
              </div>

              <div className="mt-2.5 flex justify-end gap-2">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleCancelRejection}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={actionLoading || !rejectionReason.trim()}
                  onClick={() => handleAction("reject")}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-3.5 w-3.5 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    <>
                      <FiX className="h-3.5 w-3.5" />
                      Reject Refund
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ACTIONS */}
          {!isProcessed && !isProcessing && !isRejecting && (
            <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
              {/* REQUESTED */}
              {refund.status === "REQUESTED" && (
                <>
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => setIsRejecting(true)}
                    className="flex items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <FiX className="h-3.5 w-3.5" />
                    Reject
                  </button>

                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={() => handleAction("approve")}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {actionLoading ? (
                      <>
                        <FiLoader className="h-3.5 w-3.5 animate-spin" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <FiCheck className="h-3.5 w-3.5" />
                        Approve Refund
                      </>
                    )}
                  </button>
                </>
              )}

              {/* APPROVED */}
              {refund.status === "APPROVED" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-3.5 w-3.5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FiCheck className="h-3.5 w-3.5" />
                      Process Refund
                    </>
                  )}
                </button>
              )}

              {/* FAILED */}
              {refund.status === "FAILED" && (
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleAction("process")}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-orange-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {actionLoading ? (
                    <>
                      <FiLoader className="h-3.5 w-3.5 animate-spin" />
                      Retrying...
                    </>
                  ) : (
                    "Retry Processing"
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
