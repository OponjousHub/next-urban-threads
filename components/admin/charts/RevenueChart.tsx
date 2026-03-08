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
  ComposedChart,
} from "recharts";
import { FiArrowDown, FiArrowUp, FiTrendingDown } from "react-icons/fi";

const monthlyData = [
  { name: "Jan", revenue: 4200, orders: 120, prev: 3500 },
  { name: "Feb", revenue: 3800, orders: 98, prev: 3000 },
  { name: "Mar", revenue: 5200, orders: 150, prev: 4200 },
  { name: "Apr", revenue: 6100, orders: 170, prev: 5000 },
  { name: "May", revenue: 7200, orders: 200, prev: 6100 },
  { name: "Jun", revenue: 6800, orders: 185, prev: 5900 },
];

export default function RevenueChart() {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [range, setRange] = useState("30");

  const totalRevenue = 12450;
  const totalOrders = 320;
  const avgOrder = (totalRevenue / totalOrders).toFixed(2);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold">Revenue Overview</h3>
          <p className="text-xs text-gray-500">Compare performance over time</p>
        </div>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 3 months</option>
        </select>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div>
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-xl font-bold">${totalRevenue}</p>
          <span className="flex items-center text-xs text-green-600 font-medium">
            <FiArrowUp size={11} /> 8% vs last month
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-500">Orders</p>
          <p className="text-xl font-bold">{totalOrders}</p>
          <span className="flex items-center text-xs text-green-600 font-medium">
            <span>
              <FiArrowUp size={11} />
            </span>{" "}
            <span>5%</span>
          </span>
        </div>

        <div>
          <p className="text-xs text-gray-500">Avg Order</p>
          <p className="text-xl font-bold">${avgOrder}</p>
          <span className="flex items-center text-xs text-red-500 font-medium">
            <FiArrowDown size={11} /> 2%
          </span>
        </div>
      </div>

      {/* Metric Toggle */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-4">
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

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthlyData}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
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
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              }}
            />

            {/* Previous period line */}
            <Line
              type="monotone"
              dataKey="prev"
              stroke="#cbd5f5"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />

            {/* Main metric */}
            <Area
              type="monotone"
              dataKey={metric}
              stroke="#6366F1"
              strokeWidth={3}
              fill="url(#revenueFill)"
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
