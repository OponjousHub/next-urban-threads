"use client";

import { useState } from "react";

type TrackingEvent = {
  id: string;
  status: string;
  title: string;
  description?: string;
  location?: string;
  createdAt: string;
};

type Order = {
  id: string;
  status: string;
  orderTrackingEvent: TrackingEvent[];
};

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    if (!orderId || !email) {
      setError("Please enter both Order ID and Email.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Order not found");
        return;
      }

      setOrder(data);
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- STATUS STEPS ---------------- */

  const steps = [
    "PENDING",
    "PROCESSING",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const getStepIndex = (status: string) => steps.findIndex((s) => s === status);

  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-3xl mx-auto px-6 py-16">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-4">Track Your Order</h1>
        <p className="text-gray-600 mb-8">
          Enter your order details to see the latest status.
        </p>

        {/* FORM */}
        <form onSubmit={handleTrack} className="space-y-4 mb-8">
          <input
            type="text"
            placeholder="Order ID"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full border p-3 rounded-md"
          />

          <input
            type="email"
            placeholder="Email used for order"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-md"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
          >
            {loading ? "Tracking..." : "Track Order"}
          </button>
        </form>

        {/* ERROR */}
        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

        {/* RESULT */}
        {order && (
          <div className="border rounded-xl p-6 space-y-6">
            <h2 className="text-lg font-semibold">Order #{order.id}</h2>

            {/* STATUS PROGRESS */}
            <div className="flex justify-between items-center">
              {steps.map((step, index) => {
                const currentIndex = getStepIndex(order.status);

                return (
                  <div key={step} className="flex-1 text-center">
                    <div
                      className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium
                      ${
                        index <= currentIndex
                          ? "bg-black text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <p className="text-xs mt-2">{step.replace(/_/g, " ")}</p>
                  </div>
                );
              })}
            </div>

            {/* TIMELINE */}
            <div className="border-l pl-4 space-y-6">
              {order.orderTrackingEvent.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No tracking updates yet.
                </p>
              ) : (
                order.orderTrackingEvent.map((event) => (
                  <div key={event.id} className="relative">
                    <div className="absolute -left-[9px] top-1 w-3 h-3 bg-black rounded-full" />

                    <p className="font-semibold">
                      {event.title || event.status}
                    </p>

                    {event.description && (
                      <p className="text-sm text-gray-600">
                        {event.description}
                      </p>
                    )}

                    {event.location && (
                      <p className="text-xs text-gray-500">
                        📍 {event.location}
                      </p>
                    )}

                    <p className="text-xs text-gray-400">
                      {new Date(event.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
