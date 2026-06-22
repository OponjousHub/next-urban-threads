"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    status: string;
    count: number;
  }[];
};

const COLORS = [
  "#3B82F6", // Processing
  "#8B5CF6", // Shipped
  "#10B981", // Delivered
  "#EF4444", // Cancelled
  "#F59E0B", // Refunded
];

export default function SalesByStatus({ data }: Props) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">Sales by Order Status</h3>

        <p className="text-sm text-gray-500">
          Distribution of orders across statuses
        </p>
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="status"
              outerRadius={110}
              label
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
