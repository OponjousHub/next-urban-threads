"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function OrderFilters() {
  const router = useRouter();
  const params = useSearchParams();

  // Helper to update a single URL param
  function updateParam(key: string, value: string) {
    const newParams = new URLSearchParams(params.toString());
    if (!value || value === "ALL") {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    router.push(`/admin/orders?${newParams.toString()}`);
  }

  // Helper to update both from and to dates
  function updateDateRange(from: string, to: string) {
    const newParams = new URLSearchParams(params.toString());
    if (from) newParams.set("from", from);
    else newParams.delete("from");

    if (to) newParams.set("to", to);
    else newParams.delete("to");

    router.push(`/admin/orders?${newParams.toString()}`);
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="bg-white border-b p-4 mb-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center gap-4">
      {/* Quick filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Today */}
        <button
          onClick={() => updateDateRange(today, today)}
          className={`px-3 py-1 text-sm border rounded-lg hover:bg-gray-200 ${
            params.get("from") === today && params.get("to") === today
              ? "bg-indigo-500 text-white border-indigo-500"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Today
        </button>

        {/* Last 7 days */}
        <button
          onClick={() => {
            const todayDate = new Date();
            const last7 = new Date();
            last7.setDate(todayDate.getDate() - 7);
            updateDateRange(
              last7.toISOString().split("T")[0],
              todayDate.toISOString().split("T")[0],
            );
          }}
          className={`px-3 py-1 text-sm border rounded-lg hover:bg-gray-200 ${(() => {
            const from = params.get("from");
            const to = params.get("to");
            const last7 = new Date();
            last7.setDate(new Date().getDate() - 7);
            const last7Str = last7.toISOString().split("T")[0];
            return from === last7Str && to === today
              ? "bg-indigo-500 text-white border-indigo-500"
              : "bg-gray-100 text-gray-700";
          })()}`}
        >
          Last 7 days
        </button>

        {/* Last 30 days */}
        <button
          onClick={() => {
            const todayDate = new Date();
            const last30 = new Date();
            last30.setDate(todayDate.getDate() - 30);
            updateDateRange(
              last30.toISOString().split("T")[0],
              todayDate.toISOString().split("T")[0],
            );
          }}
          className={`px-3 py-1 text-sm border rounded-lg hover:bg-gray-200 ${(() => {
            const from = params.get("from");
            const to = params.get("to");
            const last30 = new Date();
            last30.setDate(new Date().getDate() - 30);
            const last30Str = last30.toISOString().split("T")[0];
            return from === last30Str && to === today
              ? "bg-indigo-500 text-white border-indigo-500"
              : "bg-gray-100 text-gray-700";
          })()}`}
        >
          Last 30 days
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mt-2 md:mt-0">
        {/* Date Pickers */}
        <div className="flex items-center gap-2">
          <div className="flex flex-col text-xs text-gray-500">
            <span>From</span>
            <input
              type="date"
              value={params.get("from") || ""}
              onChange={(e) =>
                updateDateRange(e.target.value, params.get("to") || "")
              }
              className="px-3 py-2 border border-gray-300 rounded-lg shadow-md bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="flex flex-col text-xs text-gray-500">
            <span>To</span>
            <input
              type="date"
              value={params.get("to") || ""}
              onChange={(e) =>
                updateDateRange(params.get("from") || "", e.target.value)
              }
              className="px-3 py-2 border border-gray-300 rounded-lg shadow-md bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
            />
          </div>
        </div>

        {/* Payment Filter */}
        <div className="flex flex-col text-xs text-gray-500">
          <span>Payment</span>
          <select
            onChange={(e) => updateParam("payment", e.target.value)}
            defaultValue={params.get("payment") || "ALL"}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-md bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          >
            <option value="ALL">All Payments</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col text-xs text-gray-500">
          <span>Status</span>
          <select
            onChange={(e) => updateParam("status", e.target.value)}
            defaultValue={params.get("status") || "ALL"}
            className="px-3 py-2 border border-gray-300 rounded-lg shadow-md bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
          >
            <option value="ALL">All Status</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Search */}
        <input
          placeholder="Search orders..."
          defaultValue={params.get("query") || ""}
          onBlur={(e) => updateParam("query", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg shadow-sm text-sm w-[80%] lg:w-60 bg-gray-50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />

        {/* Reset Button */}
        <button
          onClick={() => router.push("/admin/orders")}
          className="px-3 py-2 text-sm border rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-900"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
