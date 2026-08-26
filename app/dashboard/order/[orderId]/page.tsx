"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import { appToast } from "@/utils/appToast";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/reviews/reviewForm";
import CustomerTrackingTimeline from "@/components/order/CustomerTrackingTimeline";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { DialogTitle } from "@/components/ui/dialog";
import RefundModal from "@/components/refunds/RefundModal";
import { RefundRequest } from "@prisma/client";
import RefundRequestStatus from "@/components/refunds/refundRequestStatusCard";
import { useTenant } from "@/store/tenant-provider-context";
import { ShippingMethod } from "@prisma/client";
import { RefundStatus, RefundTrackingEvent } from "@prisma/client";
import { formatCurrency } from "@/lib/formatCurrency";
import { FiX } from "react-icons/fi";

type RefundRequestWithTracking = RefundRequest & {
  trackingEvents: RefundTrackingEvent[];
};

type OrderItem = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
  image: string | undefined;
  variantColor: string | undefined;
  variantSize: string | undefined;
  price: number;
};

type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paymentReference: string | null;
  items: OrderItem[];
  createdAt: string;
  refundRequest: RefundRequestWithTracking[];
  shippingCost: number;
  shippingMethodId: string;
  shippingMethod: ShippingMethod;
  discountAmount: number;
  refundStatus: RefundStatus;
};

export default function OrderPage({ params }: { params: { orderId: string } }) {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
  const { tenant } = useTenant();

  const reference =
    searchParams.get("reference") ?? // Paystack
    searchParams.get("tx_ref") ?? // Flutterwave
    undefined;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const hasVerified = useRef(false);
  const [userReviews, setUserReviews] = useState<Record<string, any>>({});
  const [open, setOpen] = useState(false);
  const [refundOpen, setRefundOpen] = useState(false);
  const [cancellingRefund, setCancellingRefund] = useState(false);

  const latestRefundRequest = order?.refundRequest?.[0];

  async function fetchOrder() {
    try {
      const res = await fetch(`/api/orders/me/${orderId}`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await res.json();

      setOrder(data);

      return data;
    } catch (error) {
      console.error("Fetch order error:", error);
      return null;
    }
  }

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;

    async function loadOrder() {
      try {
        // ---------------------------------------------------------
        // 1. ALWAYS load the order from our database first
        // ---------------------------------------------------------

        const res = await fetch(`/api/orders/me/${orderId}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load order");
        }

        const data = await res.json();

        if (cancelled) return;

        // IMPORTANT:
        // The order is now available immediately, regardless
        // of whether payment is pending, paid, or failed.
        setOrder(data);
        setLoading(false);

        // ---------------------------------------------------------
        // 2. Only verify payment if it is actually still pending
        // ---------------------------------------------------------

        if (data.status !== "PENDING" || data.paymentStatus !== "PENDING") {
          return;
        }

        // Prevent duplicate initial verification
        if (hasVerified.current) {
          return;
        }

        hasVerified.current = true;

        const toastId = "verifying-payment";

        try {
          toast.loading("Checking payment status...", {
            id: toastId,
          });

          const verifyRes = await fetch(`/api/orders/me/${orderId}/verify`, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              reference,
            }),
          });

          // -------------------------------------------------------
          // IMPORTANT:
          // A verification failure must NEVER prevent the order
          // page from displaying.
          // -------------------------------------------------------

          if (!verifyRes.ok) {
            console.warn("Payment verification returned:", verifyRes.status);

            toast.dismiss(toastId);
            return;
          }

          const verifiedOrder = await verifyRes.json();

          if (cancelled) return;

          // Only replace the order if we actually received
          // an order object.
          if (verifiedOrder?.id) {
            setOrder(verifiedOrder);
          }

          toast.dismiss(toastId);

          if (
            verifiedOrder?.paymentStatus === "PAID" &&
            verifiedOrder?.status === "PROCESSING"
          ) {
            appToast.success("Payment verified", "Status: Paid");
          }

          if (verifiedOrder?.paymentStatus === "FAILED") {
            appToast.error("Payment failed", "Your payment was not completed.");
          }
        } catch (error) {
          console.error("Background payment verification error:", error);

          toast.dismiss(toastId);

          // DO NOT set loading(true)
          // DO NOT clear the order
          //
          // The customer can still see the order.
        }
      } catch (error) {
        console.error("Load order error:", error);

        if (cancelled) return;

        setLoading(false);

        appToast.error(
          "Unable to load order",
          "We could not load this order. Please try again.",
        );
      }
    }

    loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId, reference]);

  // POLLING EFFECT
  useEffect(() => {
    if (
      !order ||
      order.status !== "PENDING" ||
      order.paymentStatus !== "PENDING"
    ) {
      return;
    }

    let stopped = false;

    const interval = setInterval(async () => {
      if (stopped) return;

      try {
        const res = await fetch(`/api/orders/me/${orderId}/verify`, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          console.warn("Background payment verification returned:", res.status);
          return;
        }

        const data = await res.json();

        if (stopped) return;

        if (!data?.id) {
          return;
        }

        setOrder(data);

        // -------------------------------------------------------
        // Stop polling once payment reaches a terminal state
        // -------------------------------------------------------

        if (
          data.paymentStatus === "PAID" ||
          data.paymentStatus === "FAILED" ||
          data.status === "CANCELLED"
        ) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error("Background payment polling error:", error);

        // Do nothing.
        //
        // A temporary verification failure should NOT
        // break the order page.
      }
    }, 5000);

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [order?.status, order?.paymentStatus, orderId]);

  // CHECK REVIEWS
  useEffect(() => {
    if (!order) return;

    async function fetchReviews() {
      const res = await fetch(`/api/reviews/me?orderId=${orderId}`);
      if (!res.ok) return;

      const reviewData = await res.json();
      const map: Record<string, any> = {};
      reviewData.forEach((review: any) => {
        map[review.productId] = review;
      });

      setUserReviews(map);
    }

    fetchReviews();
  }, [order]);

  async function cancelRefund() {
    if (!order?.refundRequest?.length || cancellingRefund) return;

    setCancellingRefund(true);

    try {
      const res = await fetch(
        `/api/refunds/${order.refundRequest[0].id}/cancel`,
        {
          method: "POST",
        },
      );

      if (!res.ok) {
        throw new Error();
      }

      appToast.success(
        "Refund cancelled",
        "Your refund request has been cancelled.",
      );

      await fetchOrder();
    } catch {
      appToast.error(
        "Unable to cancel",
        "This refund can no longer be cancelled.",
      );
    } finally {
      setCancellingRefund(false);
    }
  }
  /* ------------------------------------
     ✅ CENTERED LOADING STATE
  ------------------------------------- */
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-[var(--color-primary)]" />

          <p className="text-sm font-medium text-gray-700">Loading order...</p>

          <p className="mt-1 text-xs text-gray-500">
            Please wait while we load your order details.
          </p>
        </div>
      </div>
    );
  }

  /* ------------------------------------
     ❌ ORDER NOT FOUND
  ------------------------------------- */
  if (!order) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <p className="text-lg text-red-500">Order not found</p>
      </main>
    );
  }

  /* ------------------------------------
     ✅ NORMAL PAGE CONTENT
  ------------------------------------- */
  return (
    <>
      <Dialog open={refundOpen} onOpenChange={setRefundOpen}>
        <DialogContent className="max-w-2xl">
          <RefundModal
            order={order}
            onClose={() => setRefundOpen(false)}
            onSuccess={fetchOrder}
          />{" "}
        </DialogContent>
      </Dialog>
      <main className="px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Order Details</h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Order Information */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Order Information</h2>

              <div className="space-y-3 text-sm">
                {/* Order ID */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Order ID</span>

                  <span className="font-medium text-right break-all">
                    {order.id}
                  </span>
                </div>

                {/* Order Status */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Status</span>

                  <span
                    className={`font-semibold ${
                      order.status === "DELIVERED"
                        ? "text-green-600"
                        : order.status === "CANCELLED" ||
                            order.status === "FAILED"
                          ? "text-red-600"
                          : order.status === "PROCESSING" ||
                              order.status === "SHIPPED" ||
                              order.status === "IN_TRANSIT" ||
                              order.status === "OUT_FOR_DELIVERY"
                            ? "text-blue-600"
                            : "text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                {/* Payment Status */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment</span>

                  <span
                    className={`font-semibold ${
                      order.paymentStatus === PaymentStatus.PAID
                        ? "text-green-600"
                        : order.paymentStatus === PaymentStatus.FAILED
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus === PaymentStatus.PAID
                      ? "PAID"
                      : order.paymentStatus === PaymentStatus.FAILED
                        ? "FAILED"
                        : "PENDING"}
                  </span>
                </div>

                {/* Payment Reference */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Payment Reference</span>

                  <span className="font-medium text-right break-all">
                    {order.paymentReference || "N/A"}
                  </span>
                </div>

                {/* Placed On */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Placed On</span>

                  <span className="text-right">
                    {new Date(order.createdAt).toLocaleDateString()}{" "}
                    {new Date(order.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

              <div className="space-y-3 text-sm">
                {/* Subtotal */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Subtotal</span>

                  <span>
                    {formatCurrency(
                      Number(order.totalAmount) -
                        Number(order.shippingCost ?? 0) +
                        Number(order.discountAmount ?? 0),
                      tenant.currency,
                    )}
                  </span>
                </div>

                {/* Shipping Method */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping Method</span>

                  <span className="text-right">
                    {order.shippingMethod?.name || "Standard Delivery"}
                  </span>
                </div>

                {/* Shipping Fee */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Shipping Fee</span>

                  <span>
                    {formatCurrency(
                      Number(order.shippingCost ?? 0),
                      tenant.currency,
                    )}
                  </span>
                </div>

                {/* Discount */}
                <div className="flex justify-between gap-4">
                  <span className="text-gray-500">Discount</span>

                  <span className="text-green-600">
                    -{" "}
                    {formatCurrency(
                      Number(order.discountAmount ?? 0),
                      tenant.currency,
                    )}
                  </span>
                </div>

                <hr />

                {/* Final Amount */}
                <div className="border-t pt-4 flex items-center justify-between gap-4">
                  <p className="font-bold">
                    {order.paymentStatus === PaymentStatus.PAID
                      ? "Total Paid"
                      : order.paymentStatus === PaymentStatus.FAILED
                        ? "Order Total"
                        : "Amount Due"}
                  </p>

                  <p className="font-bold">
                    {formatCurrency(Number(order.totalAmount), tenant.currency)}
                  </p>
                </div>

                {/* Payment Explanation */}
                {order.paymentStatus === PaymentStatus.PENDING && (
                  <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3 mt-3">
                    <p className="text-xs text-yellow-800">
                      Your payment is still pending. We are checking the payment
                      status automatically. If payment is not completed, this
                      order will be cancelled automatically.
                    </p>
                  </div>
                )}

                {order.paymentStatus === PaymentStatus.FAILED && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-3 mt-3">
                    <p className="text-xs text-red-800">
                      This payment was not completed. The amount shown above was
                      not charged.
                    </p>
                  </div>
                )}

                {order.paymentStatus === PaymentStatus.PAID && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-3 mt-3">
                    <p className="text-xs text-green-800">
                      Your payment has been successfully confirmed.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Refund Status card */}
          <div className="mb-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold">Refund Status</h2>

            {/* NONE */}
            {order.refundStatus === "NONE" &&
              order.paymentStatus === PaymentStatus.PAID &&
              order.status === "DELIVERED" && (
                <div className="flex justify-between gap-4">
                  <div>
                    <p className="font-medium text-green-600">
                      Eligible for refund
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Your order has been delivered. If there's an issue, you
                      may request a refund.
                    </p>
                  </div>

                  <button
                    onClick={() => setRefundOpen(true)}
                    className="w-fit rounded-xl bg-red-500 px-5 py-2 text-white hover:bg-red-600"
                  >
                    Request Refund
                  </button>
                </div>
              )}

            {/* REQUESTED */}
            {order.refundStatus === "REQUESTED" && (
              <div className="rounded-xl border border-yellow-200 bg-yellow-50 p-4">
                <p className="font-semibold text-yellow-700">
                  Refund Requested
                </p>

                <p className="mt-1 text-sm text-yellow-600">
                  We've received your refund request and it is awaiting review.
                </p>

                <button
                  onClick={cancelRefund}
                  disabled={cancellingRefund}
                  className="mt-4 inline-flex items-center justify-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {cancellingRefund ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                      Cancelling...
                    </>
                  ) : (
                    "Cancel Request"
                  )}
                </button>
              </div>
            )}

            {/* APPROVED */}
            {order.refundStatus === "APPROVED" && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-semibold text-blue-700">Refund Approved</p>

                <p className="mt-1 text-sm text-blue-600">
                  Your refund has been approved and will be processed shortly.
                </p>
              </div>
            )}

            {/* PROCESSING */}
            {order.refundStatus === "PROCESSING" && (
              <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
                <p className="font-semibold text-indigo-700">
                  Refund Processing
                </p>

                <p className="mt-1 text-sm text-indigo-600">
                  Your payment provider is currently processing your refund.
                </p>
              </div>
            )}

            {/* REFUNDED */}
            {order.refundStatus === "REFUNDED" && (
              <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                <p className="font-semibold text-green-700">Refund Completed</p>

                <p className="mt-1 text-sm text-green-600">
                  Your refund has been completed successfully.
                </p>
              </div>
            )}

            {/* REJECTED */}
            {order.refundStatus === "REJECTED" && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100">
                    <FiX className="h-5 w-5 text-red-600" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-red-700">
                      Refund Rejected
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-600">
                      Unfortunately, your refund request was rejected.
                    </p>

                    {/* Admin rejection reason */}
                    {latestRefundRequest?.rejectionReason && (
                      <div className="mt-4 rounded-lg border border-red-200 bg-white p-3">
                        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                          Reason for rejection
                        </p>

                        <p className="mt-1 text-sm leading-5 text-gray-700">
                          {latestRefundRequest.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* FAILED */}
            {order.refundStatus === "FAILED" && (
              <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
                <p className="font-semibold text-orange-700">Refund Failed</p>

                <p className="mt-1 text-sm text-orange-600">
                  We couldn't complete your refund. Our support team has been
                  notified.
                </p>
              </div>
            )}

            {/* CANCELLED */}
            {order.refundStatus === "CANCELLED" && (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <p className="font-semibold text-gray-700">Refund Cancelled</p>

                <p className="mt-1 text-sm text-gray-600">
                  This refund request was cancelled.
                </p>
              </div>
            )}
          </div>

          <CustomerTrackingTimeline orderId={order.id} />
          {order.refundStatus !== "NONE" && (
            <RefundRequestStatus
              status={order.refundStatus}
              refund={order.refundRequest && order.refundRequest[0]}
            />
          )}

          <h2 className="text-2xl font-semibold mb-3 mt-6">Items</h2>

          <ul className="border rounded-lg p-4 space-y-4">
            {order?.items?.map((item) => {
              return (
                <li key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.image || item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    {item.variantColor && item.variantSize && (
                      <p className="text-sm text-gray-500">
                        {item.variantColor} / {item.variantSize}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Unit Price:{" "}
                      {formatCurrency(Number(item.price), tenant.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">
                      {formatCurrency(
                        Number(item.price) * item.quantity,
                        tenant.currency,
                      )}
                    </p>

                    {order.status === "DELIVERED" && (
                      <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                          <DialogTitle className="text-lg font-semibold">
                            <button className="text-[var(--color-primary)] text-sm font-medium hover:underline">
                              {userReviews[item.product.id]
                                ? "Edit Review"
                                : "Write Review"}
                            </button>
                          </DialogTitle>
                        </DialogTrigger>

                        <DialogContent className="[&>button]:hidden sm:max-w-lg">
                          <ReviewForm
                            productId={item.product.id}
                            existingReview={userReviews[item.product.id]}
                            onSuccess={(review) => {
                              if (review) {
                                setUserReviews((prev) => ({
                                  ...prev,
                                  [item.product.id]: review,
                                }));
                              }

                              setOpen(false);
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>

          {verifying && (
            <p className="mt-6 text-center text-yellow-600 text-sm">
              Verifying payment…
            </p>
          )}
        </div>
      </main>
    </>
  );
}
