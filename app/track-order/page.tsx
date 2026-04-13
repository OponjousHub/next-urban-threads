"use client";

import { useState } from "react";

type OrderStatus = "processing" | "shipped" | "out_for_delivery" | "delivered";

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<null | {
    id: string;
    status: OrderStatus;
    estimatedDelivery: string;
  }>(null);
  const [error, setError] = useState("");

  // 🔹 Mock API call (replace later with real API)
  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOrder(null);

    // fake validation
    if (!orderId || !email) {
      setError("Please enter both Order ID and Email.");
      return;
    }

    // simulate API delay
    await new Promise((res) => setTimeout(res, 1000));

    // fake response
    if (orderId === "12345") {
      setOrder({
        id: "12345",
        status: "shipped",
        estimatedDelivery: "April 18, 2026",
      });
    } else {
      setError("Order not found. Please check your details.");
    }
  };

  const steps: { key: OrderStatus; label: string }[] = [
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const getStepIndex = (status: OrderStatus) =>
    steps.findIndex((s) => s.key === status);

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
            placeholder="Order ID (e.g. 12345)"
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
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition"
          >
            Track Order
          </button>
        </form>

        {/* ERROR */}
        {error && <p className="text-red-500 text-sm mb-6">{error}</p>}

        {/* RESULT */}
        {order && (
          <div className="border rounded-xl p-6">
            <h2 className="text-lg font-semibold mb-4">Order #{order.id}</h2>

            {/* STATUS STEPS */}
            <div className="flex justify-between items-center mb-6">
              {steps.map((step, index) => {
                const currentIndex = getStepIndex(order.status);

                return (
                  <div key={step.key} className="flex-1 text-center">
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
                    <p className="text-xs mt-2">{step.label}</p>
                  </div>
                );
              })}
            </div>

            {/* DELIVERY INFO */}
            <p className="text-sm text-gray-600">
              Estimated Delivery:{" "}
              <span className="font-medium">{order.estimatedDelivery}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
