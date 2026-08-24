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
    const res = await fetch(`/api/orders/me/${orderId}`);

    if (!res.ok) return;

    const data = await res.json();

    setOrder(data);
  }

  useEffect(() => {
    if (!orderId || hasVerified.current) return;
    hasVerified.current = true;

    const toastId = "verifying";

    async function verifyOrder() {
      try {
        toast.loading("Verifying payment...", { id: toastId });

        const res = await fetch(`/api/orders/me/${orderId}/verify`, {
          method: "POST",
          credentials: "include",
          body: JSON.stringify({ reference }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();
        setOrder(data);

        toast.dismiss(toastId);

        if (data.status === "PAID") {
          appToast.success("Payment verified", "Status: Paid");
        } else if (data.status === "FAILED") {
          appToast.error("Payment failed!", "Status: Failed");
        }
      } catch (err) {
        toast.dismiss(toastId);
        appToast.error("Verification failed", "Could not verify payment");
      } finally {
        setLoading(false);
      }
    }

    verifyOrder();
  }, [orderId]);

  // VERIFY ODER
  useEffect(() => {
    if (!order || order.status !== "PENDING") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/me/${orderId}/verify`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) return;

      const data = await res.json();
      setOrder(data);

      if (data.status === "PAID") {
        clearInterval(interval);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [order, orderId]);

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
      <main className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-indigo-600" />
          <p className="text-sm text-gray-500">Loading order…</p>
        </div>
      </main>
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
     ORDER IS PENDING
  ------------------------------------- */
  if (order.status === "PENDING") {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Confirming payment…</h2>
        <p className="text-sm text-gray-500">
          Please wait while we verify your payment.
        </p>
      </div>
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
                <div className="flex justify-between">
                  <span className="text-gray-500">Order ID</span>
                  <span className="font-medium">{order.id}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>

                  <span
                    className={`font-semibold ${
                      order.status === "DELIVERED"
                        ? "text-green-600"
                        : order.status === "CANCELLED"
                          ? "text-red-600"
                          : "text-yellow-600"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Payment</span>

                  <span
                    className={`font-semibold ${
                      order.paymentStatus === PaymentStatus.PAID
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {order.paymentStatus}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Payment Reference</span>
                  <span className="font-medium">
                    {order.paymentReference || "N/A"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Placed On</span>
                  <span>
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
                <div className="flex justify-between">
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

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Method</span>

                  <span>
                    {order.shippingMethod?.name || "Standard Delivery"}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Fee</span>

                  <span>
                    {formatCurrency(
                      Number(order.shippingCost ?? 0),
                      tenant.currency,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
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

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Paid</span>

                  <span>
                    {formatCurrency(Number(order.totalAmount), tenant.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Refund Status card */}
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
                            onSuccess={() => setOpen(false)}
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
