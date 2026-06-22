"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  data: {
    month: string;
    customers: number;
  }[];
};

export default function CustomerGrowthChart({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm ">
      <div className="mb-4">
        <h3 className="font-semibold text-lg">Customer Growth Trend</h3>

        <p className="text-sm text-gray-500">Monthly customer acquisition</p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Line
              type="monotone"
              dataKey="customers"
              stroke="#2563eb"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
