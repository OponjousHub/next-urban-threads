"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", revenue: 4200 },
  { month: "Feb", revenue: 3800 },
  { month: "Mar", revenue: 5200 },
  { month: "Apr", revenue: 6100 },
  { month: "May", revenue: 7200 },
  { month: "Jun", revenue: 6800 },
  { month: "Jul", revenue: 8100 },
  { month: "Aug", revenue: 9200 },
];

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold mb-6">Revenue Overview</h3>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />

            <XAxis
              dataKey="month"
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              }}
            />

            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#6366F1"
              strokeWidth={3}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
