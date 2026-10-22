"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// import toast from "react-hot-toast";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";

export default function OrderPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState<any>(null);
  const { tenant } = useTenant();
  // Initial fetch
  useEffect(() => {
    fetch(`/api/orders/${orderId}`)
      .then((res) => res.json())
      .then(setOrder);
  }, [orderId]);

  // Polling for payment confirmation
  useEffect(() => {
    if (!order || order.status !== "PENDING") return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/orders/${orderId}`);
      const data = await res.json();

      setOrder(data);

      if (data.status === "PAID") {
        clearInterval(interval);
        appToast.success("Success", "Payment successful 🎉");
      }

      if (data.status === "FAILED") {
        clearInterval(interval);
        appToast.error("Error", "Payment failed ❌");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [order, orderId]);

  if (!order) return <p>Loading order...</p>;

  return (
    <div>
      <h1>Order #{order.id}</h1>
      <p>Status: {order.status}</p>

      {order.status === "PENDING" && <p>Processing payment, please wait...</p>}

      {order.status === "PAID" && <p>✅ Payment confirmed</p>}
    </div>
  );
}
