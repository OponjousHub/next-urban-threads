"use client";

import { useEffect, useState } from "react";

type Event = {
  id: string;
  title?: string;
  description?: string;
  location?: string;
  status: string;
  createdAt: string;
};

const ORDER_STEPS = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export default function CustomerTrackingTimeline({
  orderId,
  isCancellationCompleted = false,
}: {
  orderId: string;
  isCancellationCompleted?: boolean;
}) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId) return;

    const fetchEvents = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}/tracking`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tracking events");
        }

        const data = await res.json();

        const sorted = [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        // Only display the latest "Payment confirmed" event.
        // Any subsequent/duplicate payment-confirmed events are ignored.
        let paymentConfirmedShown = false;

        const filtered = sorted.filter((event) => {
          const isPaymentConfirmed =
            event.title?.trim().toLowerCase() === "payment confirmed";

          if (isPaymentConfirmed) {
            if (paymentConfirmedShown) {
              return false;
            }

            paymentConfirmedShown = true;
          }

          return true;
        });

        setEvents(filtered);
      } catch (err) {
        console.error("Failed to fetch tracking events:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();

    const interval = setInterval(fetchEvents, 5000);

    return () => clearInterval(interval);
  }, [orderId]);

  /* ---------------- HELPERS ---------------- */

  const formatStatus = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Order placed";
      case "PROCESSING":
        return "Processing";
      case "SHIPPED":
        return "Shipped";
      case "OUT_FOR_DELIVERY":
        return "Out for delivery";
      case "DELIVERED":
        return "Delivered";
      default:
        return status;
    }
  };

  const getDefaultMessage = (status: string) => {
    switch (status) {
      case "PENDING":
        return "Your order has been received";
      case "PROCESSING":
        return "We are preparing your order";
      case "SHIPPED":
        return "Your package is on the way";
      case "OUT_FOR_DELIVERY":
        return "Your package is out for delivery and will arrive today";
      case "DELIVERED":
        return "Your order has been delivered";
      default:
        return "";
    }
  };

  const getStatusIndex = (status: string) => {
    return ORDER_STEPS.indexOf(status);
  };

  const currentStatus = events[0]?.status;
  const currentIndex = getStatusIndex(currentStatus);

  /* ---------------- UI STATES ---------------- */

  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <p className="text-gray-500">Loading tracking...</p>
      </div>
    );
  }

  if (!events.length) {
    return (
      <div className="bg-white border rounded-xl p-4">
        <p className="text-gray-400">No tracking updates yet</p>
      </div>
    );
  }

  if (isCancellationCompleted) {
    return (
      <div className="bg-white border rounded-xl p-6 space-y-6">
        <h2 className="text-xl font-semibold">Order Tracking</h2>

        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-3 w-3 rounded-full bg-black shrink-0" />
            <div>
              <p className="font-semibold">Order Placed</p>
              <p className="mt-1 text-sm text-gray-600">
                Your order was successfully placed and payment was received.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="mt-1 h-3 w-3 rounded-full bg-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-700">Order Cancelled</p>
              <p className="mt-1 text-sm text-gray-600">
                Your cancellation was completed after your refund was
                successfully processed.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="bg-white border rounded-xl p-6 space-y-6">
      <h2 className="text-xl font-semibold">Tracking</h2>

      {/* 🔥 PROGRESS BAR */}
      <div>
        <div className="flex justify-between text-xs mb-2 text-gray-500">
          {ORDER_STEPS.map((step) => (
            <span key={step}>{formatStatus(step)}</span>
          ))}
        </div>

        <div className="relative h-2 bg-gray-200 rounded-full">
          <div
            className="absolute h-2 bg-black rounded-full transition-all"
            style={{
              width: `${((currentIndex + 1) / ORDER_STEPS.length) * 100}%`,
            }}
          />
        </div>

        <p className="mt-2 text-sm font-medium">
          Current: {formatStatus(currentStatus)}
        </p>
      </div>

      {/* 🔥 TIMELINE */}
      <div className="border-l pl-5 space-y-6">
        {events.map((event, index) => (
          <div key={event.id} className="relative">
            <div
              className={`absolute -left-[11px] top-1 w-3 h-3 rounded-full ${
                index === 0 ? "bg-black" : "bg-gray-300"
              }`}
            />

            <p className="font-semibold">
              {event.title || formatStatus(event.status)}
            </p>

            <p className="text-sm text-gray-600 mt-1">
              {event.description || getDefaultMessage(event.status)}
            </p>

            {event.location && (
              <p className="text-xs text-gray-500 mt-1">📍 {event.location}</p>
            )}

            <p className="text-xs text-gray-400 mt-1">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
