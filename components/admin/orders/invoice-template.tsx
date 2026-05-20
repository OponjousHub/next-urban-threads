"use client";

import { useTenant } from "@/store/tenant-provider-context";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variantImage?: string | null;
  variantColor?: string | null;
  variantSize?: string | null;
}

interface InvoiceData {
  id: string;
  createdAt: string;
  paymentStatus: string;
  totalAmount: number;
  status: string;

  // tenant: {
  //   name: string;
  //   email: string;
  //   logo?: string | null;
  // };

  customer: {
    name: string | null;
    email: string | null;
  } | null;

  items: InvoiceItem[];
}

export default function InvoiceTemplate({ order }: { order: InvoiceData }) {
  const { tenant } = useTenant();

  return (
    <div id="invoice" className="bg-white p-12 text-black max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-8 mb-8">
        {/* Store info */}
        <div className="flex items-start gap-4">
          {tenant.logo && (
            <img
              src={tenant.logo}
              alt={tenant.name}
              className="w-16 h-16 rounded-xl object-cover border border-gray-200"
            />
          )}

          <div>
            <h1 className="text-3xl font-bold text-gray-900">{tenant.name}</h1>

            <p className="text-sm text-gray-500 mt-1">{tenant.email}</p>

            {/* {tenant.phone && (
              <p className="text-sm text-gray-500">
                {tenant.phone}
              </p>
            )} */}
          </div>
        </div>

        {/* Invoice details */}
        <div className="text-right">
          <h2 className="text-3xl font-bold tracking-wide text-gray-900">
            INVOICE
          </h2>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-semibold">Invoice #</span>{" "}
              {order.id.slice(-8).toUpperCase()}
            </p>

            <p>
              <span className="font-semibold">Date:</span>{" "}
              {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <p>
              <span className="font-semibold">Payment:</span>{" "}
              {order.paymentStatus}
            </p>
          </div>
        </div>
      </div>

      {/* BILLING SECTION */}
      <div className="grid grid-cols-2 gap-10 border-b border-gray-200 pb-8 mb-8">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Bill To</h3>

          <p className="font-medium">{order.customer?.name}</p>

          <p className="text-gray-500">{order.customer?.email}</p>
        </div>

        <div className="text-right">
          <h3 className="font-semibold text-gray-900 mb-3">Order Summary</h3>

          <p className="text-gray-600">Status: {order.status}</p>

          <p className="text-gray-600">Items: {order.items.length}</p>
        </div>
      </div>

      {/* ITEMS TABLE */}
      <table className="w-full">
        <thead>
          <tr className="border-b text-gray-600">
            <th className="text-left py-4 font-semibold">Item</th>

            <th className="text-center font-semibold">Qty</th>

            <th className="text-center font-semibold">Price</th>

            <th className="text-right font-semibold">Total</th>
          </tr>
        </thead>

        <tbody>
          {order.items.map((item) => (
            <tr key={item.id} className="border-b">
              <td className="py-5">
                <div className="flex items-center gap-4">
                  <img
                    src={item.variantImage || item.image}
                    alt={item.name}
                    className="w-14 h-14 rounded-lg object-cover border"
                  />

                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>

                    {(item.variantColor || item.variantSize) && (
                      <p className="text-sm text-gray-500">
                        {item.variantColor}

                        {item.variantColor && item.variantSize && " / "}

                        {item.variantSize}
                      </p>
                    )}
                  </div>
                </div>
              </td>

              <td className="text-center">{item.quantity}</td>

              <td className="text-center">
                {tenant.currency}
                {item.price.toFixed(2)}
              </td>

              <td className="text-right font-medium">
                {tenant.currency}
                {(item.quantity * item.price).toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TOTAL */}
      <div className="flex justify-end mt-10">
        <div className="w-72 border-t-2 border-gray-900 pt-5">
          <div className="flex justify-between">
            <span className="text-xl font-bold">Total</span>

            <span className="text-xl font-bold">
              {tenant.currency}
              {order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-20 pt-6 border-t text-center">
        <p className="text-sm text-gray-500">
          Thank you for shopping with {tenant.name}
        </p>

        <p className="text-xs text-gray-400 mt-2">
          This invoice serves as proof of payment.
        </p>
      </div>
    </div>
  );
}
