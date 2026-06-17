"use client";

import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  customer: any;
  vendorId: string;
  address?: {
    id: string;
    createdAt: Date;
    city: string;
    country: string;
    phone: string | null;
    updatedAt: Date;
    isDeleted: boolean;
    tenantId: string;
    userId: string;
    fullName: string | null;
    street: string;
    state: string | null;
  } | null;
};

export default function CustomerDetailUI({ customer, address }: Props) {
  const { tenant } = useTenant();
  const totalOrders = customer.orders.length;

  const totalSpent = customer.orders.reduce(
    (sum: number, order: any) => sum + Number(order.totalAmount),
    0,
  );

  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const lastOrder = customer.orders.length > 0 ? customer.orders[0] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)] text-xl font-bold text-white">
            {customer.name?.charAt(0)?.toUpperCase() || "C"}
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              {customer.name || "Unnamed Customer"}
            </h1>

            <p className="text-sm text-gray-500">{customer.email}</p>

            <p className="text-sm text-gray-500">
              Joined {new Date(customer.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Orders</p>

          <p className="mt-2 text-2xl font-bold">{totalOrders}</p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Total Spend</p>

          <p className="mt-2 text-2xl font-bold">
            {tenant.currency}
            {totalSpent.toLocaleString()}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Average Order</p>

          <p className="mt-2 text-2xl font-bold">
            {tenant.currency}
            {avgOrderValue.toFixed(2)}
          </p>
        </div>

        <div className="rounded-2xl border bg-white p-5">
          <p className="text-sm text-gray-500">Last Order</p>

          <p className="mt-2 text-sm font-medium">
            {lastOrder
              ? new Date(lastOrder.createdAt).toLocaleDateString()
              : "No orders"}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Customer Information</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Info label="Phone" value={customer.phone} />

          <Info label="Country" value={customer.country} />

          <Info label="City" value={customer.city} />

          <Info
            label="Address"
            value={`${address?.street}, ${address?.city}, ${address?.state ? address?.state : ""}, ${address?.country}`}
          />

          <Info label="Status" value={customer.status} />
        </div>
      </div>

      {/* Orders */}
      <div className="rounded-2xl border bg-white">
        <div className="border-b p-5">
          <h2 className="font-semibold">Orders</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm">
                <th className="p-4">Order ID</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Amount</th>
              </tr>
            </thead>

            <tbody>
              {customer.orders.map((order: any) => (
                <tr key={order.id} className="border-b">
                  <td className="p-4">
                    {tenant.currency}
                    {order.id.slice(0, 8)}
                  </td>

                  <td className="p-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4">{order.status}</td>

                  <td className="p-4">
                    {tenant.currency}
                    {Number(order.totalAmount).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reviews */}
      <div className="rounded-2xl border bg-white md:mx-8">
        <div className="border-b p-5">
          <h2 className="font-semibold">Reviews</h2>
        </div>

        <div className="space-y-4 p-5">
          {customer.reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews yet.</p>
          ) : (
            customer.reviews.map((review: any) => (
              <div key={review.id} className="rounded-xl border p-4 ">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{review.product?.name}</p>

                  <p className="text-sm">⭐ {review.rating}/5</p>
                </div>

                <p className="mt-2 text-sm text-gray-600">{review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs uppercase text-gray-500">{label}</p>

      <p className="font-medium">{value || "-"}</p>
    </div>
  );
}
