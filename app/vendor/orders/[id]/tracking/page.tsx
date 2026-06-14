"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

/* ---------------- TYPES ---------------- */

type Event = {
  id: string;
  status: string;
  title?: string;
  message?: string;
  location?: string;
  createdAt: string;
};

/* ---------------- CONFIG ---------------- */

const STATUS_CONFIG: Record<string, { title: string; message: string }> = {
  PENDING: {
    title: "Order placed",
    message: "Your order has been received",
  },
  PROCESSING: {
    title: "Processing",
    message: "We are preparing your order",
  },
  SHIPPED: {
    title: "Shipped",
    message: "Your package has left our warehouse",
  },
  OUT_FOR_DELIVERY: {
    title: "Out for delivery",
    message: "Your package is out for delivery and will arrive today",
  },
  DELIVERED: {
    title: "Delivered",
    message: "Your order has been delivered",
  },
};

const ORDER_FLOW = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

/* ---------------- COMPONENT ---------------- */

export default function AdminOrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [location, setLocation] = useState("");

  if (!orderId) return null;

  /* ---------------- FETCH ---------------- */

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${orderId}/tracking`);
      const data = await res.json();
      console.log("THIS IS THE EVENTS +++++", data);

      // newest first
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );

      setEvents(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  console.log("THIS IS THE EVENTS -------", events);
  /* ---------------- QUICK ACTION ---------------- */

  const handleQuickUpdate = async (status: string) => {
    const config = STATUS_CONFIG[status];
    if (!config) return;

    setActiveStatus(status); // 🔥 locks UI instantly

    try {
      await fetch(`/api/admin/orders/${orderId}/tracking`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          title: config.title,
          message: config.message,
          location,
          type: "STATUS_CHANGE",
        }),
      });

      setLocation("");
      await fetchEvents();
    } catch (err) {
      console.error(err);
    } finally {
      setActiveStatus(null);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="grid grid-cols-2 gap-10 p-6">
      {/* LEFT: QUICK ACTIONS */}
      <div className="space-y-4 border p-4 rounded-xl">
        <h2 className="font-semibold text-lg">Update Tracking</h2>

        {/* LOCATION INPUT */}
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location (e.g. Ikeja, Lagos)"
          className="border p-2 w-full rounded"
        />

        {/* 🔥 ONE CLICK BUTTONS */}
        <div className="grid grid-cols-2 gap-3">
          {ORDER_FLOW.map((status) => {
            const config = STATUS_CONFIG[status];
            const statusIndex = ORDER_FLOW.indexOf(status);

            const currentStatus = events[0]?.status;
            const currentIndex = ORDER_FLOW.indexOf(currentStatus);

            const isLoading = activeStatus === status;

            // ❌ Disable if:
            const isDisabled =
              activeStatus !== null || // something is being submitted
              statusIndex <= currentIndex; // already reached or passed

            return (
              <button
                key={status}
                onClick={() => handleQuickUpdate(status)}
                disabled={isDisabled}
                className={`p-3 rounded text-sm font-medium border transition
          ${
            isLoading
              ? "bg-gray-200 cursor-not-allowed"
              : isDisabled
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-black text-white hover:bg-gray-800"
          }
        `}
              >
                {isLoading ? "Updating..." : config.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: TIMELINE */}
      <div className="border p-4 rounded-xl">
        <h2 className="font-semibold text-lg mb-4">Tracking Timeline</h2>

        {loading ? (
          <div className="text-gray-500 text-sm">Loading timeline...</div>
        ) : (
          <div className="border-l pl-4 space-y-6">
            {events.map((event, index) => (
              <div key={event.id} className="relative">
                <div
                  className={`absolute -left-[9px] top-1 w-3 h-3 rounded-full ${
                    index === 0 ? "bg-black" : "bg-gray-300"
                  }`}
                />

                <p className="font-semibold">{event.title || event.status}</p>

                {event.message && (
                  <p className="text-sm text-gray-600">{event.message}</p>
                )}

                {event.location && (
                  <p className="text-xs text-gray-500">📍 {event.location}</p>
                )}

                <p className="text-xs text-gray-400">
                  {new Date(event.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
