"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  coupon: any;
};

export default function CouponDetail({ coupon }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  async function toggleCoupon() {
    try {
      setLoading(true);

      await fetch(`/api/coupons/${coupon.id}`, {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          active: !coupon.active,
        }),
      });

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function deleteCoupon() {
    if (!confirm("Delete this coupon permanently?")) {
      return;
    }

    try {
      setLoading(true);

      await fetch(`/api/coupons/${coupon.id}`, {
        method: "DELETE",
      });

      router.push("/vendor/coupons");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 p-4">
      {/* HEADER */}

      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{coupon.code}</h1>

            <p className="mt-2 text-gray-500">{coupon.description}</p>
          </div>

          <span
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              coupon.active
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {coupon.active ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {/* KPI */}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Discount</p>

          <h3 className="mt-2 text-2xl font-bold">
            {coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.value}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Usage Limit</p>

          <h3 className="mt-2 text-2xl font-bold">
            {coupon.usageLimit ?? "∞"}
          </h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Times Used</p>

          <h3 className="mt-2 text-2xl font-bold">{coupon.usedCount}</h3>
        </div>

        <div className="rounded-xl border bg-white p-5">
          <p className="text-sm text-gray-500">Remaining</p>

          <h3 className="mt-2 text-2xl font-bold">
            {coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : "∞"}
          </h3>
        </div>
      </div>

      {/* SETTINGS */}

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Coupon Settings</h2>

        <div className="space-y-2">
          <p>Minimum Order: {coupon.minimumAmount || "None"}</p>

          <p>
            Start:{" "}
            {coupon.startsAt
              ? new Date(coupon.startsAt).toLocaleDateString()
              : "Immediately"}
          </p>

          <p>
            Expiry:{" "}
            {coupon.expiresAt
              ? new Date(coupon.expiresAt).toLocaleDateString()
              : "Never"}
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            onClick={toggleCoupon}
            disabled={loading}
            className="rounded-xl border px-4 py-2"
          >
            {coupon.active ? "Disable Coupon" : "Enable Coupon"}
          </button>

          <Link
            href={`/vendor/coupons/${coupon.id}/edit`}
            className="rounded-xl border px-4 py-2"
          >
            Edit Coupon
          </Link>
        </div>
      </div>

      {/* RECENT ORDERS */}

      <div className="rounded-2xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Orders Using This Coupon</h2>

        <div className="overflow-hidden rounded-xl border">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">Order</th>

                <th className="px-4 py-3 text-left">Customer</th>

                <th className="px-4 py-3 text-left">Total</th>

                <th className="px-4 py-3 text-left">Date</th>
              </tr>
            </thead>

            <tbody>
              {coupon.orders.map((order: any) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3">#{order.id.slice(-8)}</td>

                  <td className="px-4 py-3">{order.customerEmail}</td>

                  <td className="px-4 py-3">{order.totalAmount}</td>

                  <td className="px-4 py-3">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DANGER */}

      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <h3 className="font-semibold text-red-700">Danger Zone</h3>

        <button
          onClick={deleteCoupon}
          disabled={loading}
          className="mt-4 rounded-xl bg-red-600 px-4 py-2 text-white"
        >
          Delete Coupon
        </button>
      </div>
    </div>
  );
}
