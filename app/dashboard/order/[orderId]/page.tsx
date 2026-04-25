"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useParams } from "next/navigation";
import toast from "react-hot-toast";
import { GetToast } from "@/components/ui/adminToast";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ReviewForm } from "@/components/reviews/reviewForm";
import CustomerTrackingTimeline from "@/components/order/CustomerTrackingTimeline";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { DialogTitle } from "@/components/ui/dialog";
import RefundModal from "@/components/refunds/RefundModal";

type OrderItem = {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
    images: string[];
  };
  quantity: number;
};

type Order = {
  id: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  totalAmount: number;
  paymentReference: string | null;
  items: OrderItem[];
  createdAt: string;
};

export default function OrderPage({ params }: { params: { orderId: string } }) {
  const { orderId } = useParams<{ orderId: string }>();
  const searchParams = useSearchParams();
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
          toast.custom(
            <GetToast title="Payment verified!" description="Status: Paid" />,
            { duration: 4000 },
          );
        } else if (data.status === "FAILED") {
          toast.custom(
            <GetToast title="Payment failed!" description="Status: Failed" />,
            { duration: 4000 },
          );
        }
      } catch (err) {
        toast.dismiss(toastId);
        toast.custom(
          <GetToast
            type="error"
            title="Verification failed"
            description="Could not verify payment"
          />,
          { duration: 4000 },
        );
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
      // const res = await fetch(`/api/reviews/me`);
      const res = await fetch(`/api/reviews/me?orderId=${orderId}`);
      if (!res.ok) return;

      const reviewData = await res.json();
      // convert to lookup map by productId
      const map: Record<string, any> = {};
      reviewData.forEach((review: any) => {
        map[review.productId] = review;
      });

      setUserReviews(map);
    }

    fetchReviews();
  }, [order]);

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
          <RefundModal order={order} onClose={() => setRefundOpen(false)} />
        </DialogContent>
      </Dialog>
      <main className="px-4 py-10">
        {/* <Toaster position="top-right" /> */}

        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Order Details</h1>

            {order.paymentStatus === PaymentStatus.PAID &&
              order.status === "DELIVERED" && (
                <button
                  onClick={() => setRefundOpen(true)}
                  className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Request Refund
                </button>
              )}
          </div>

          <div className="mb-6 space-y-1">
            <p>
              <span className="font-semibold">Order ID:</span> {order.id}
            </p>
            <p>
              <span className="font-semibold">Status:</span>{" "}
              <span
                className={`font-bold ${
                  order.paymentStatus === PaymentStatus.PAID
                    ? "text-green-600"
                    : order.status === "CANCELLED"
                      ? "text-red-600"
                      : "text-yellow-600"
                }`}
              >
                {order.status}
              </span>
            </p>
            <p>
              <span className="font-semibold">Total Amount:</span> $
              {order.totalAmount}
            </p>
            <p>
              <span className="font-semibold">Payment Reference:</span>{" "}
              {order.paymentReference || "N/A"}
            </p>
            <p>
              <span className="font-semibold">Created At:</span>{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>
          </div>

          <CustomerTrackingTimeline orderId={order.id} />

          <h2 className="text-2xl font-semibold mb-3">Items</h2>

          <ul className="border rounded-lg p-4 space-y-4">
            {order?.items?.map((item) => {
              return (
                <li key={item.id} className="flex items-center gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-16 h-16 rounded-md object-cover"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity}
                    </p>
                    <p className="text-sm text-gray-600">
                      Price: ${item.product.price}
                    </p>
                  </div>
                  <div>
                    <p className="font-bold">
                      ${item.product.price * item.quantity}
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
