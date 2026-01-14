"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";

// export default function OrderPage() {
//   const { orderId } = useParams();
//   const searchParams = useSearchParams();
//   const reference = searchParams.get("reference");

//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     async function loadOrder() {
//       const res = await fetch(`/api/orders/${orderId}/verify`, {
//         method: "POST",
//         body: JSON.stringify({ reference }),
//       });

//       const data = await res.json();
//       setOrder(data);
//       setLoading(false);
//     }

//     loadOrder();
//   }, [orderId, reference]);

//   if (loading) return <p>Verifying payment...</p>;

//   if (!order) return <p>Order not found</p>;

//   return (
//     <div className="max-w-xl mx-auto py-10">
//       <h1 className="text-2xl font-bold mb-4">Order #{order.id}</h1>

//       <p className="mb-2">Total: ₦{order.total}</p>

//       <p
//         className={`font-semibold ${
//           order.status === "PAID"
//             ? "text-green-600"
//             : order.status === "FAILED"
//             ? "text-red-600"
//             : "text-yellow-600"
//         }`}
//       >
//         Status: {order.status}
//       </p>
//     </div>
//   );
// }

// app/order/[orderId]/page.tsx

import { notFound } from "next/navigation";

type OrderPageProps = {
  params: {
    orderId: string;
  };
};

type Order = {
  id: string;
  status: "PENDING" | "PAID" | "FAILED";
  totalAmount: number;
  reference: string;
  createdAt: string;
};

async function getOrder(orderId: string): Promise<Order | null> {
  // TEMP: replace with Prisma later
  // This simulates fetching an order from your DB
  return {
    id: orderId,
    status: "PAID",
    totalAmount: 45000,
    reference: "PSK_123456789",
    createdAt: new Date().toISOString(),
  };
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderId } = useParams();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      const res = await fetch(`/api/orders/${orderId}/verify`, {
        method: "POST",
        body: JSON.stringify({ reference }),
      });

      const data = await res.json();
      setOrder(data);
      setLoading(false);
    }

    loadOrder();
  }, [orderId, reference]);

  if (!order) {
    notFound();
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-6">Order Details</h1>

      <div className="border rounded-lg p-6 bg-white shadow-sm space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-600">Order ID</span>
          <span className="font-medium">{order.id}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Payment Reference</span>
          <span className="font-medium">{order.reference}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Amount Paid</span>
          <span className="font-semibold">
            ₦{order.totalAmount.toLocaleString()}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Status</span>
          <span
            className={`font-semibold ${
              order.status === "PAID"
                ? "text-green-600"
                : order.status === "FAILED"
                ? "text-red-600"
                : "text-yellow-600"
            }`}
          >
            {order.status}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600">Date</span>
          <span>{new Date(order.createdAt).toLocaleString()}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex gap-4">
        <a
          href="/"
          className="px-6 py-3 rounded-md bg-gray-200 hover:bg-gray-300"
        >
          Continue Shopping
        </a>

        {order.status !== "PAID" && (
          <button className="px-6 py-3 rounded-md bg-black text-white hover:bg-gray-800">
            Retry Payment
          </button>
        )}
      </div>
    </main>
  );
}
