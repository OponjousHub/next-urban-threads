"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

const monthlyData = [
  { name: "Jan", revenue: 4200, orders: 120 },
  { name: "Feb", revenue: 3800, orders: 98 },
  { name: "Mar", revenue: 5200, orders: 150 },
  { name: "Apr", revenue: 6100, orders: 170 },
  { name: "May", revenue: 7200, orders: 200 },
  { name: "Jun", revenue: 6800, orders: 185 },
];

const weeklyData = [
  { name: "Mon", revenue: 900, orders: 20 },
  { name: "Tue", revenue: 1100, orders: 25 },
  { name: "Wed", revenue: 800, orders: 18 },
  { name: "Thu", revenue: 1300, orders: 32 },
  { name: "Fri", revenue: 1700, orders: 40 },
  { name: "Sat", revenue: 2100, orders: 48 },
  { name: "Sun", revenue: 1600, orders: 35 },
];

export default function RevenueChart() {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [range, setRange] = useState<"weekly" | "monthly">("monthly");

  const data = range === "monthly" ? monthlyData : weeklyData;

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Analytics Overview</h3>

        <div className="flex items-center gap-4">
          {/* Metric Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-3 py-1 text-sm rounded-md ${
                metric === "revenue" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              Revenue
            </button>

            <button
              onClick={() => setMetric("orders")}
              className={`px-3 py-1 text-sm rounded-md ${
                metric === "orders" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              Orders
            </button>
          </div>

          {/* Range Selector */}
          <select
            value={range}
            onChange={(e) => setRange(e.target.value as "weekly" | "monthly")}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorMetric" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />

            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />

            <Area
              type="monotone"
              dataKey={metric}
              stroke="#6366F1"
              strokeWidth={3}
              fill="url(#colorMetric)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
