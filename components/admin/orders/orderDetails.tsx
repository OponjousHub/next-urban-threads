"use client";

import { useRouter } from "next/navigation";
import { AdminToast } from "@/components/ui/adminToast";
import InvoiceTemplate from "./invoice-template";
import { useState } from "react";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";

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
  const { tenant } = useTenant();

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
      appToast.success("Order updated", `Order status updated to ${newStatus}`);
    } catch (err) {
      console.error(err);
      appToast.error("Update failed", "Could not update order status");
    } finally {
      setLoading(false);
    }
  }

  const printInvoice = () => {
    const invoice = document.getElementById("invoice");

    if (!invoice) return;

    const printWindow = window.open("", "_blank", "width=1000,height=900");

    if (!printWindow) return;

    printWindow.document.write(`
  <!DOCTYPE html>
  <html>
    <head>
      <title>Invoice</title>

      <style>

      body{
        font-family: Inter, Arial, sans-serif;
        padding:30px;
        color:#111827;
        background:white;
      }

      .invoice-container{
        max-width:800px;
        margin:auto;
      }

      h1,h2,h3,p{
        margin:0;
      }

      img{
        width:50px !important;
        height:50px !important;
        object-fit:cover;
        border-radius:8px;
      }

      table{
        width:100%;
        border-collapse:collapse;
        margin-top:30px;
      }

      th{
        background:#f8fafc;
        text-align:left;
        padding:12px;
        font-size:14px;
      }

      td{
        padding:14px 12px;
        border-bottom:1px solid #e5e7eb;
        vertical-align:middle;
      }

      .item{
        display:flex;
        gap:12px;
        align-items:center;
      }

      .variant{
        font-size:12px;
        color:#6b7280;
      }

      .summary{
        width:300px;
        margin-left:auto;
        margin-top:30px;
      }

      .summary-row{
        display:flex;
        justify-content:space-between;
        padding:8px 0;
      }

      .total{
        font-size:18px;
        font-weight:bold;
        border-top:2px solid #111;
        padding-top:15px;
      }

      .footer{
        text-align:center;
        margin-top:60px;
        color:#6b7280;
        font-size:13px;
      }

      </style>
    </head>

    <body>
      <div class="invoice-container">
      ${invoice.innerHTML}
      </div>
    </body>
  </html>
`);

    printWindow.document.close();

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 300);
  };

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
                {tenant.currency}
                {localOrder.totalAmount.toFixed(2)}
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
                    appToast.success("Copied", "Order ID copied to clipboard");
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
                  onClick={printInvoice}
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
                  {tenant.currency}
                  {localOrder.totalAmount.toFixed(2)}
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
                      {tenant.currency}
                      {item.price.toFixed(2)} each
                    </p>
                  </div>
                </div>

                {/* RIGHT */}
                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {tenant.currency}
                    {(item.price * item.quantity).toFixed(2)}
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
      <div className="hidden">
        <InvoiceTemplate order={localOrder} />
      </div>
    </div>
  );
}
