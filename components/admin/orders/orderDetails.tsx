"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import InvoiceTemplate from "@/components/admin/orders/invoice-template";
import { useState } from "react";

interface OrderItem {
  id: string;

  name: string;

  quantity: number;

  price: number;

  image: string;

  variantImage?: string | null;

  variantColor?: string | null;

  variantSize?: string | null;
}

interface Customer {
  name: string;
  email: string;
}

interface Order {
  id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: OrderItem[];
  customer: Customer | null;
}

export default function OrderDetails({ order }: { order: Order }) {
  const [localOrder, setLocalOrder] = useState(order);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function updateStatus(newStatus: string) {
    if (!localOrder) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders/${localOrder.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      setLocalOrder({ ...localOrder, status: newStatus });
      toast.custom(
        <AdminToast
          type="success"
          title="Order updated"
          description={`Order status updated to ${newStatus}`}
        />,
        { duration: 6000 },
      );
    } catch (err) {
      console.error(err);
      toast.custom(
        <AdminToast
          type="error"
          title="Update failed"
          description="Could not update order status"
        />,
        { duration: 6000 },
      );
    } finally {
      setLoading(false);
    }
  }

  if (!localOrder) return <p className="p-6 text-gray-500">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* HEADER */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          {/* LEFT */}
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Order
              </h1>

              <span className="rounded-full bg-gray-900 px-3 py-1 text-xs font-medium text-white">
                #{localOrder.id.slice(0, 10)}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500">
              Placed on{" "}
              {new Date(localOrder.createdAt).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </p>
          </div>

          {/* STATUS + TOTAL */}
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Payment
              </p>

              <div className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                ${
                  localOrder.paymentStatus === "PAID"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
                >
                  {localOrder.paymentStatus}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Status
              </p>

              <div className="mt-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                ${
                  localOrder.status === "DELIVERED"
                    ? "bg-green-100 text-green-700"
                    : localOrder.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : localOrder.status === "CANCELLED"
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                }`}
                >
                  {localOrder.status}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border bg-white px-5 py-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold text-gray-900">
                ${localOrder.totalAmount.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* TOP GRID */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          {/* CUSTOMER CARD */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-black to-gray-700 text-xl font-bold text-white shadow-lg">
                  {localOrder.customer?.name?.charAt(0)}
                </div>

                <div>
                  <p className="text-lg font-semibold text-gray-900">
                    {localOrder.customer?.name}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {localOrder.customer?.email}
                  </p>

                  <p className="mt-3 inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    Customer
                  </p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS */}
            <div className="mt-8 border-t pt-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Quick Actions
                  </h2>

                  <p className="text-sm text-gray-500">
                    Manage and process this order faster
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {/* COPY ORDER ID */}
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(localOrder.id);

                    toast.custom(
                      <AdminToast
                        type="success"
                        title="Copied"
                        description="Order ID copied to clipboard"
                      />,
                      { duration: 4000 },
                    );
                  }}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black group-hover:text-white">
                    📋
                  </div>

                  <p className="font-semibold text-gray-900">Copy Order ID</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Quickly copy this order reference
                  </p>
                </button>

                {/* CONTACT CUSTOMER */}
                <a
                  href={`mailto:${localOrder.customer?.email}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black group-hover:text-white">
                    ✉️
                  </div>

                  <p className="font-semibold text-gray-900">
                    Contact Customer
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    Send email to customer
                  </p>
                </a>

                {/* PRINT INVOICE */}
                <button
                  onClick={() => window.print()}
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gray-100 transition group-hover:bg-black group-hover:text-white">
                    🖨️
                  </div>

                  <p className="font-semibold text-gray-900">Print Invoice</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Generate printable invoice
                  </p>
                </button>

                {/* TRACK ORDER */}
                <button
                  onClick={() =>
                    router.push(`/admin/orders/${order.id}/tracking`)
                  }
                  className="group rounded-2xl border border-gray-200 bg-white p-4 text-left transition-all hover:-translate-y-1 hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    🚚
                  </div>

                  <p className="font-semibold text-gray-900">Track Order</p>

                  <p className="mt-1 text-sm text-gray-500">
                    Update shipment tracking
                  </p>
                </button>
              </div>
            </div>
          </div>

          {/* ORDER INFO CARD */}
          <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Info
                </h2>

                <p className="text-sm text-gray-500">Manage order workflow</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-sm text-gray-500">Order Date</span>

                <span className="text-sm font-medium text-gray-900">
                  {new Date(localOrder.createdAt).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-sm text-gray-500">Items</span>

                <span className="text-sm font-medium text-gray-900">
                  {localOrder.items.length}
                </span>
              </div>

              <div className="flex items-center justify-between border-b pb-4">
                <span className="text-sm text-gray-500">Payment</span>

                <span className="text-sm font-medium text-gray-900">
                  {localOrder.paymentStatus}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total</span>

                <span className="text-xl font-bold text-gray-900">
                  ${localOrder.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="mt-8 space-y-3">
              {localOrder.status !== "DELIVERED" && (
                <button
                  onClick={() => updateStatus("DELIVERED")}
                  disabled={loading}
                  className="w-full rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Delivered
                </button>
              )}

              {localOrder.status !== "CANCELLED" && (
                <button
                  onClick={() => updateStatus("CANCELLED")}
                  disabled={loading}
                  className="w-full rounded-2xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-50"
                >
                  Cancel Order
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ITEMS */}
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Order Items
              </h2>

              <p className="text-sm text-gray-500">
                Products purchased in this order
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col gap-4 rounded-3xl border border-gray-100 bg-gradient-to-b from-white to-gray-50 p-5 transition hover:border-gray-200 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                {/* LEFT */}
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={item.variantImage || item.image}
                      alt={item.name}
                      className="h-24 w-24 rounded-2xl object-cover shadow-sm"
                    />

                    <div className="absolute -bottom-2 -right-2 rounded-full bg-white px-2 py-1 text-xs font-semibold shadow">
                      x{item.quantity}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.name}
                    </h3>

                    {(item.variantColor || item.variantSize) && (
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        {item.variantColor && (
                          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                            {item.variantColor}
                          </span>
                        )}

                        {item.variantSize && (
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {item.variantSize}
                          </span>
                        )}
                      </div>
                    )}

                    <p className="mt-3 text-sm text-gray-500">
                      ${item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    {item.quantity} item
                    {item.quantity > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // return (
  //   <div className="p-6 space-y-6">
  //     <h1 className="text-2xl font-semibold">Order #{localOrder.id}</h1>

  //     <div className="flex flex-col md:flex-row md:justify-between gap-4">
  //       <div className="flex items-center gap-3 m-4">
  //         <div className="h-12 w-12 rounded-full bg-black text-white flex items-center justify-center font-semibold">
  //           {localOrder.customer?.name?.charAt(0)}
  //         </div>

  //         <div>
  //           <p className="font-semibold">{localOrder.customer?.name}</p>

  //           <p className="text-sm text-gray-500">
  //             {localOrder.customer?.email}
  //           </p>
  //         </div>
  //       </div>
  //       <div className="bg-white rounded-xl shadow p-4 w-full md:w-1/3">
  //         <h2 className="font-medium text-lg mb-2">Order Info</h2>
  //         <p>
  //           <span className="font-medium">Date:</span>{" "}
  //           {new Date(localOrder.createdAt).toLocaleString()}
  //         </p>
  //         <div>
  //           <p className="font-medium">
  //             Status:
  //             <span
  //               className={`px-3 py-1 rounded-full text-xs font-semibold
  // ${
  //   localOrder.status === "DELIVERED"
  //     ? "bg-green-100 text-green-700"
  //     : localOrder.status === "PENDING"
  //       ? "bg-yellow-100 text-yellow-700"
  //       : localOrder.status === "CANCELLED"
  //         ? "bg-red-100 text-red-700"
  //         : "bg-blue-100 text-blue-700"
  // }`}
  //             >
  //               {localOrder.status}
  //             </span>
  //           </p>
  //         </div>
  //         <p>
  //           <span className="font-medium">Payment:</span>{" "}
  //           {localOrder.paymentStatus}
  //         </p>
  //         <p>
  //           <span className="font-medium">Total:</span> $
  //           {localOrder.totalAmount.toFixed(2)}
  //         </p>
  //         <div className="mt-3 flex gap-2 flex-wrap">
  //           {localOrder.status !== "DELIVERED" && (
  //             <button
  //               onClick={() => updateStatus("DELIVERED")}
  //               disabled={loading}
  //               className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition"
  //             >
  //               Mark as Delivered
  //             </button>
  //           )}
  //           {localOrder.status !== "CANCELLED" && (
  //             <button
  //               onClick={() => updateStatus("CANCELLED")}
  //               disabled={loading}
  //               className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
  //             >
  //               Cancel Order
  //             </button>
  //           )}
  //           <button
  //             onClick={() => router.push(`/admin/orders/${order.id}/tracking`)}
  //             className="bg-blue-600 text-white px-4 py-2 rounded mt-2 w-full"
  //           >
  //             Track Order
  //           </button>
  //         </div>{" "}
  //       </div>{" "}
  //     </div>

  //     {/* QUICK ACTIONS */}
  //     <div className="bg-white rounded-xl shadow p-4">
  //       <h2 className="font-medium text-lg mb-4">Quick Actions</h2>

  //       <div className="flex flex-wrap gap-3">
  //         {/* Copy Order ID */}
  //         <button
  //           onClick={() => {
  //             navigator.clipboard.writeText(localOrder.id);

  //             toast.custom(
  //               <AdminToast
  //                 type="success"
  //                 title="Copied"
  //                 description="Order ID copied to clipboard"
  //               />,
  //               { duration: 4000 },
  //             );
  //           }}
  //           className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
  //         >
  //           Copy Order ID
  //         </button>

  //         {/* Contact Customer */}
  //         <a
  //           href={`mailto:${localOrder.customer?.email}`}
  //           className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
  //         >
  //           Contact Customer
  //         </a>

  //         {/* Print Invoice */}
  //         <button
  //           onClick={() => window.print()}
  //           className="px-4 py-2 rounded-lg border hover:bg-gray-50 transition"
  //         >
  //           Print Invoice
  //         </button>
  //       </div>
  //       {/* </div> */}
  //     </div>

  //     <div className="bg-white rounded-xl shadow p-4">
  //       <h2 className="font-medium text-lg mb-3">Items</h2>

  //       <div className="space-y-4">
  //         {order.items.map((item) => (
  //           <div
  //             key={item.id}
  //             className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
  //           >
  //             <div className="flex items-center gap-4">
  //               <img
  //                 src={item.variantImage || item.image}
  //                 alt={item.name}
  //                 className="h-20 w-20 rounded-xl object-cover"
  //               />

  //               <div>
  //                 <h3 className="font-semibold text-gray-900">{item.name}</h3>

  //                 {(item.variantColor || item.variantSize) && (
  //                   <p className="text-sm text-gray-500 mt-1">
  //                     <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
  //                       {item.variantColor}
  //                     </span>

  //                     {item.variantColor && item.variantSize && " / "}
  //                     {item.variantSize}
  //                   </p>
  //                 )}

  //                 <p className="text-sm text-gray-400 mt-1">
  //                   Qty: {item.quantity}
  //                 </p>
  //               </div>
  //             </div>

  //             <div className="text-right">
  //               <p className="font-semibold">
  //                 ${(item.price * item.quantity).toFixed(2)}
  //               </p>

  //               <p className="text-sm text-gray-500">
  //                 ${item.price.toFixed(2)} each
  //               </p>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   </div>
  // );
}
