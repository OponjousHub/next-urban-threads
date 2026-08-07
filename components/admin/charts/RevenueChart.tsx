// "use client";

// import { useState, useEffect } from "react";
// import { formatCurrency } from "@/lib/formatCurrency";
// import {
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Area,
//   ComposedChart,
// } from "recharts";
// import { FiArrowDown, FiArrowUp } from "react-icons/fi";

// type Trend = "up" | "down" | "neutral";

// export default function RevenueChart() {
//   const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
//   const [range, setRange] = useState("30");

//   const [revenue, setRevenue] = useState(0);
//   const [orders, setOrders] = useState(0);
//   const [avgOrderValue, setAvgOrderValue] = useState(0);

//   const [revenueChange, setRevenueChange] = useState(0);
//   const [ordersChange, setOrdersChange] = useState(0);
//   const [avgOrderChange, setAvgOrderChange] = useState(0);

//   const [revenueTrend, setRevenueTrend] = useState<Trend>("neutral");
//   const [ordersTrend, setOrdersTrend] = useState<Trend>("neutral");
//   const [avgTrend, setAvgTrend] = useState<Trend>("neutral");

//   const [chartData, setChartData] = useState<any[]>([]);
//   const [currency, setCurrency] = useState("NGN");

//   useEffect(() => {
//     async function loadData() {
//       const res = await fetch(`/api/admin/revenue?range=${range}`);
//       const data = await res.json();

//       setCurrency(data.currency || "NGN");

//       setRevenue(data.revenue);
//       setOrders(data.orders);
//       setAvgOrderValue(data.avgOrderValue);

//       setRevenueChange(data.revenueChange);
//       setOrdersChange(data.ordersChange);
//       setAvgOrderChange(data.avgOrderChange);

//       setRevenueTrend(data.revenueTrend);
//       setOrdersTrend(data.ordersTrend);
//       setAvgTrend(data.avgOrderTrend);

//       setChartData(data.chartData);
//     }

//     loadData();
//   }, [range]);

//   function getTrendColor(trend: Trend) {
//     if (trend === "up") return "text-green-600";
//     if (trend === "down") return "text-red-500";
//     return "text-gray-500";
//   }

//   function TrendIcon({ trend }: { trend: Trend }) {
//     if (trend === "up") return <FiArrowUp size={11} />;
//     if (trend === "down") return <FiArrowDown size={11} />;
//     return <span className="w-[11px]" />;
//   }

//   return (
//     <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-semibold">Revenue Overview</h3>
//           <p className="text-xs text-gray-500">Compare performance over time</p>
//         </div>

//         <select
//           value={range}
//           onChange={(e) => setRange(e.target.value)}
//           className="text-sm border border-gray-200 rounded-lg px-3 py-1"
//         >
//           <option value="7">Last 7 days</option>
//           <option value="30">Last 30 days</option>
//           <option value="90">Last 3 months</option>
//         </select>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-3 gap-6 mb-6">
//         {/* Revenue */}
//         <div>
//           <p className="text-xs text-gray-500">Revenue</p>
//           <p className="text-xl font-bold">
//             {formatCurrency(revenue, currency)}
//           </p>

//           <span
//             className={`flex items-center text-xs font-medium ${getTrendColor(
//               revenueTrend,
//             )}`}
//           >
//             <TrendIcon trend={revenueTrend} />
//             {Math.abs(revenueChange).toFixed(1)}% vs last period
//           </span>
//         </div>

//         {/* Orders */}
//         <div>
//           <p className="text-xs text-gray-500">Orders</p>
//           <p className="text-xl font-bold">{orders}</p>

//           <span
//             className={`flex items-center text-xs font-medium ${getTrendColor(
//               ordersTrend,
//             )}`}
//           >
//             <TrendIcon trend={ordersTrend} />
//             {Math.abs(ordersChange).toFixed(1)}% vs last period
//           </span>
//         </div>

//         {/* Avg Order */}
//         <div>
//           <p className="text-xs text-gray-500">Avg Order</p>
//           <p className="text-xl font-bold">
//             {formatCurrency(avgOrderValue, currency)}
//           </p>

//           <span
//             className={`flex items-center text-xs font-medium ${getTrendColor(
//               avgTrend,
//             )}`}
//           >
//             <TrendIcon trend={avgTrend} />
//             {Math.abs(avgOrderChange).toFixed(1)}% vs last period
//           </span>
//         </div>
//       </div>

//       {/* Metric Toggle */}
//       <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-4">
//         <button
//           onClick={() => setMetric("revenue")}
//           className={`px-3 py-1 text-sm rounded-md ${
//             metric === "revenue" ? "bg-white shadow-sm" : "text-gray-500"
//           }`}
//         >
//           Revenue
//         </button>

//         <button
//           onClick={() => setMetric("orders")}
//           className={`px-3 py-1 text-sm rounded-md ${
//             metric === "orders" ? "bg-white shadow-sm" : "text-gray-500"
//           }`}
//         >
//           Orders
//         </button>
//       </div>

//       {/* Chart */}
//       <div className="h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <ComposedChart data={chartData}>
//             <defs>
//               <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
//                 <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
//               </linearGradient>
//             </defs>

//             <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12 }}
//               allowDecimals={false}
//             />

//             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

//             <Tooltip
//               contentStyle={{
//                 borderRadius: "10px",
//                 border: "none",
//                 boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
//               }}
//             />

//             {/* Previous period */}
//             <Line
//               type="monotone"
//               dataKey="prev"
//               stroke="#cbd5f5"
//               strokeWidth={2}
//               strokeDasharray="5 5"
//               dot={false}
//             />

//             {/* Main metric */}
//             <Area
//               type="monotone"
//               dataKey={metric}
//               stroke="#6366F1"
//               strokeWidth={3}
//               fill="url(#revenueFill)"
//               dot={{ r: 4 }}
//               activeDot={{ r: 6 }}
//             />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
"use client";

import { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

type Trend = "up" | "down" | "neutral";

interface ChartData {
  name: string;
  revenue: number;
  orders: number;
  prev: number;
}

export default function RevenueChart() {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [range, setRange] = useState("30");

  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  const [revenueChange, setRevenueChange] = useState(0);
  const [ordersChange, setOrdersChange] = useState(0);
  const [avgOrderChange, setAvgOrderChange] = useState(0);

  const [revenueTrend, setRevenueTrend] = useState<Trend>("neutral");
  const [ordersTrend, setOrdersTrend] = useState<Trend>("neutral");
  const [avgTrend, setAvgTrend] = useState<Trend>("neutral");

  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);

        const res = await fetch(`/api/admin/revenue?range=${range}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error("Failed to load revenue data");
        }

        const data = await res.json();

        if (cancelled) return;

        setRevenue(Number(data.revenue) || 0);
        setOrders(Number(data.orders) || 0);
        setAvgOrderValue(Number(data.avgOrderValue) || 0);

        setRevenueChange(Number(data.revenueChange) || 0);
        setOrdersChange(Number(data.ordersChange) || 0);
        setAvgOrderChange(Number(data.avgOrderChange) || 0);

        setRevenueTrend(data.revenueTrend ?? "neutral");
        setOrdersTrend(data.ordersTrend ?? "neutral");
        setAvgTrend(data.avgOrderTrend ?? "neutral");

        setChartData(Array.isArray(data.chartData) ? data.chartData : []);
      } catch (error) {
        console.error("Failed to load revenue chart:", error);

        if (!cancelled) {
          setChartData([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [range]);

  function getTrendColor(trend: Trend) {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-500";
    return "text-gray-500";
  }

  function TrendIcon({ trend }: { trend: Trend }) {
    if (trend === "up") return <FiArrowUp size={11} />;
    if (trend === "down") return <FiArrowDown size={11} />;

    return <span className="w-[11px]" />;
  }

  return (
    <section
      aria-labelledby="revenue-overview-title"
      className="h-full rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md sm:p-6"
    >
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3
            id="revenue-overview-title"
            className="text-base font-semibold tracking-tight text-gray-900 sm:text-lg"
          >
            Revenue Overview
          </h3>

          <p className="mt-1 text-xs text-gray-500 sm:text-sm">
            Compare performance over time
          </p>
        </div>

        <label className="sr-only" htmlFor="revenue-range">
          Revenue date range
        </label>

        <select
          id="revenue-range"
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="
            w-full rounded-lg border border-gray-200
            bg-white px-3 py-2 text-sm text-gray-700
            shadow-sm outline-none transition
            hover:border-gray-300
            focus:border-[var(--color-primary)]
            focus:ring-2 focus:ring-[var(--color-primary)]/20
            sm:w-auto
          "
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 gap-4 border-y border-gray-100 py-5 sm:grid-cols-3 sm:gap-6">
        {/* Revenue */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Revenue
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            ₦{revenue.toLocaleString()}
          </p>

          <span
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${getTrendColor(
              revenueTrend,
            )}`}
          >
            <TrendIcon trend={revenueTrend} />
            {Math.abs(revenueChange).toFixed(1)}% vs last period
          </span>
        </div>

        {/* Orders */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Orders
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            {orders.toLocaleString()}
          </p>

          <span
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${getTrendColor(
              ordersTrend,
            )}`}
          >
            <TrendIcon trend={ordersTrend} />
            {Math.abs(ordersChange).toFixed(1)}% vs last period
          </span>
        </div>

        {/* Average Order */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Avg. Order
          </p>

          <p className="mt-1 text-xl font-bold tracking-tight text-gray-900">
            ₦
            {avgOrderValue.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>

          <span
            className={`mt-1 flex items-center gap-1 text-xs font-medium ${getTrendColor(
              avgTrend,
            )}`}
          >
            <TrendIcon trend={avgTrend} />
            {Math.abs(avgOrderChange).toFixed(1)}% vs last period
          </span>
        </div>
      </div>

      {/* Metric Toggle */}
      <div
        className="mt-5 inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1"
        role="group"
        aria-label="Chart metric"
      >
        <button
          type="button"
          onClick={() => setMetric("revenue")}
          aria-pressed={metric === "revenue"}
          className={`
            rounded-md px-3 py-1.5 text-sm font-medium
            outline-none transition-all
            focus-visible:ring-2
            focus-visible:ring-[var(--color-primary)]
            focus-visible:ring-offset-1
            ${
              metric === "revenue"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }
          `}
        >
          Revenue
        </button>

        <button
          type="button"
          onClick={() => setMetric("orders")}
          aria-pressed={metric === "orders"}
          className={`
            rounded-md px-3 py-1.5 text-sm font-medium
            outline-none transition-all
            focus-visible:ring-2
            focus-visible:ring-[var(--color-primary)]
            focus-visible:ring-offset-1
            ${
              metric === "orders"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }
          `}
        >
          Orders
        </button>
      </div>

      {/* Chart */}
      <div
        className="mt-4 h-64 sm:h-72"
        aria-label={`${metric === "revenue" ? "Revenue" : "Orders"} performance chart`}
      >
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-full w-full animate-pulse rounded-xl bg-gray-50" />
          </div>
        ) : chartData.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-500">
              No data available for this period.
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={chartData}
              margin={{
                top: 8,
                right: 8,
                left: -12,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0.25}
                  />

                  <stop
                    offset="95%"
                    stopColor="var(--color-primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#e5e7eb"
                opacity={0.7}
                vertical={false}
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                minTickGap={24}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                width={42}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
                formatter={(value, name) => {
                  const numericValue = Number(value ?? 0);

                  if (name === "revenue") {
                    return [`$${numericValue.toLocaleString()}`, "Revenue"];
                  }

                  if (name === "orders") {
                    return [numericValue.toLocaleString(), "Orders"];
                  }

                  return [numericValue.toLocaleString(), String(name ?? "")];
                }}
              />

              {/* Previous period */}
              <Line
                type="monotone"
                dataKey="prev"
                stroke="#d1d5db"
                strokeWidth={1.5}
                strokeDasharray="5 5"
                dot={false}
                activeDot={false}
              />

              {/* Main metric */}
              <Area
                type="monotone"
                dataKey={metric}
                stroke="var(--color-primary)"
                strokeWidth={2.5}
                fill="url(#revenueFill)"
                dot={false}
                activeDot={{
                  r: 5,
                  strokeWidth: 2,
                  stroke: "#fff",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </section>
  );
}
