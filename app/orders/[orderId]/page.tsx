// "use client";

// import { useEffect, useState } from "react";
// import { useParams } from "next/navigation";
// // import toast from "react-hot-toast";
// import { useTenant } from "@/store/tenant-provider-context";
// import { appToast } from "@/utils/appToast";

// export default function OrderPage() {
//   const { orderId } = useParams();
//   const [order, setOrder] = useState<any>(null);
//   const { tenant } = useTenant();
//   // Initial fetch
//   useEffect(() => {
//     fetch(`/api/orders/${orderId}`)
//       .then((res) => res.json())
//       .then(setOrder);
//   }, [orderId]);

//   // Polling for payment confirmation
//   useEffect(() => {
//     if (!order || order.status !== "PENDING") return;

//     const interval = setInterval(async () => {
//       const res = await fetch(`/api/orders/${orderId}`);
//       const data = await res.json();

//       setOrder(data);

//       if (data.status === "PAID") {
//         clearInterval(interval);
//         appToast.success("Success", "Payment successful 🎉");
//       }

//       if (data.status === "FAILED") {
//         clearInterval(interval);
//         appToast.error("Error", "Payment failed ❌");
//       }
//     }, 3000);

//     return () => clearInterval(interval);
//   }, [order, orderId]);

//   if (!order) return <p>Loading order...</p>;

//   return (
//     <div>
//       <h1>Order #{order.id}</h1>
//       <p>Status: {order.status}</p>

//       {order.status === "PENDING" && <p>Processing payment, please wait...</p>}

//       {order.status === "PAID" && <p>✅ Payment confirmed</p>}
//     </div>
//   );
// }
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { appToast } from "@/utils/appToast";

type TrackingEvent = {
  id: string;
  title: string;
  description?: string | null;
  status?: string | null;
  createdAt: string;
};

type OrderData = {
  id: string;
  status: string;
  paymentStatus: string;
  trackingEvents?: TrackingEvent[];
};

export default function OrderPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params.orderId;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrder = useCallback(async () => {
    const response = await fetch(`/api/orders/me/${orderId}`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to retrieve your order.");
    }

    const data: OrderData = await response.json();

    setOrder(data);
    return data;
  }, [orderId]);

  const fetchTracking = useCallback(async () => {
    const response = await fetch(`/api/orders/${orderId}/tracking`, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Unable to retrieve order tracking.");
    }

    const data: TrackingEvent[] = await response.json();
    setTrackingEvents(data);
  }, [orderId]);

  // Load the order and its tracking history.
  useEffect(() => {
    let cancelled = false;

    async function loadOrder() {
      try {
        const [orderResponse, trackingResponse] = await Promise.all([
          fetch(`/api/orders/me/${orderId}`, { cache: "no-store" }),
          fetch(`/api/orders/${orderId}/tracking`, { cache: "no-store" }),
        ]);

        if (!orderResponse.ok) {
          throw new Error("Unable to retrieve your order.");
        }

        if (!trackingResponse.ok) {
          throw new Error("Unable to retrieve order tracking.");
        }

        const orderData: OrderData = await orderResponse.json();
        const trackingData: TrackingEvent[] = await trackingResponse.json();

        if (!cancelled) {
          setOrder(orderData);
          setTrackingEvents(trackingData);
        }
      } catch (error) {
        if (!cancelled) {
          appToast.error(
            "Error",
            error instanceof Error
              ? error.message
              : "Unable to load your order.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      cancelled = true;
    };
  }, [orderId]);

  // Poll while payment is pending. Refresh tracking when payment changes.
  useEffect(() => {
    if (!order || order.paymentStatus !== "PENDING") return;

    let cancelled = false;
    let paymentSuccessNotified = false;

    const interval = setInterval(async () => {
      try {
        const previousPaymentStatus = order.paymentStatus;
        const updatedOrder = await fetchOrder();

        if (cancelled) return;

        if (updatedOrder.paymentStatus === "PAID") {
          clearInterval(interval);

          if (!paymentSuccessNotified) {
            paymentSuccessNotified = true;
            appToast.success("Success", "Payment successful 🎉");
          }

          await fetchTracking();
        } else if (
          updatedOrder.paymentStatus === "FAILED" ||
          updatedOrder.status === "CANCELLED"
        ) {
          clearInterval(interval);
          appToast.error("Error", "Payment failed or the order was cancelled.");
          await fetchTracking();
        } else if (previousPaymentStatus !== updatedOrder.paymentStatus) {
          await fetchTracking();
        }
      } catch (error) {
        console.error("Order payment polling error:", error);
      }
    }, 3000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order?.paymentStatus, order?.status, fetchOrder, fetchTracking]);

  if (loading) {
    return <div className="p-6">Loading your order...</div>;
  }

  if (!order) {
    return <div className="p-6">Unable to load your order.</div>;
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      {" "}
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        {" "}
        <h1 className="text-xl font-semibold">Order #{order.id}</h1>
        ```
        <div className="mt-4 space-y-2">
          <p>
            Status: <strong>{order.status}</strong>
          </p>

          <p>
            Payment: <strong>{order.paymentStatus}</strong>
          </p>
        </div>
        {order.paymentStatus === "PENDING" && (
          <p className="mt-4 text-sm text-gray-600">
            We&apos;re waiting for payment confirmation. This page will update
            automatically.
          </p>
        )}
        {order.paymentStatus === "PAID" && (
          <p className="mt-4 font-medium text-green-700">
            ✅ Payment confirmed
          </p>
        )}
        {order.paymentStatus === "FAILED" && (
          <p className="mt-4 font-medium text-red-600">
            Payment failed. Please contact support if you were charged.
          </p>
        )}
      </section>
      <section className="rounded-lg border bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Order tracking</h2>

        {trackingEvents.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            No tracking updates are available yet.
          </p>
        ) : (
          <ol className="mt-4 space-y-5">
            {trackingEvents.map((event) => (
              <li key={event.id} className="border-l-2 border-gray-200 pl-4">
                <p className="font-medium">{event.title}</p>

                {event.description && (
                  <p className="mt-1 text-sm text-gray-600">
                    {event.description}
                  </p>
                )}

                <p className="mt-1 text-xs text-gray-500">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
