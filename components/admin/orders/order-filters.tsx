"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();

  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());

    if (value === "ALL") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }

    router.push(`?${newParams.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Status Filter */}
      <select
        onChange={(e) => updateParam("status", e.target.value)}
        defaultValue={params.get("status") || "ALL"}
        className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm"
      >
        <option value="ALL">All Status</option>
        <option value="PROCESSING">Processing</option>
        <option value="SHIPPED">Shipped</option>
        <option value="DELIVERED">Delivered</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {/* Payment Filter */}
      <select
        onChange={(e) => updateParam("payment", e.target.value)}
        defaultValue={params.get("payment") || "ALL"}
        className="px-3 py-2 border rounded-lg text-sm bg-white shadow-sm"
      >
        <option value="ALL">All Payments</option>
        <option value="PAID">Paid</option>
        <option value="PENDING">Pending</option>
        <option value="FAILED">Failed</option>
      </select>

      {/* Search */}
      <input
        placeholder="Search orders..."
        defaultValue={params.get("query") || ""}
        onChange={(e) => updateParam("query", e.target.value)}
        className="px-3 py-2 border rounded-lg text-sm w-48"
      />

      {/* Reset */}
      <button
        onClick={() => router.push("/admin/orders")}
        className="px-3 py-2 text-sm border rounded-lg hover:bg-gray-100"
      >
        Reset
      </button>
    </div>
  );
}
