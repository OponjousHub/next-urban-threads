"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

type Props = {
  data: {
    status: string;
    count: number;
  }[];
};

const STATUS_COLORS: Record<string, string> = {
  PROCESSING: "#3B82F6",
  SHIPPED: "#8B5CF6",
  DELIVERED: "#10B981",
  CANCELLED: "#EF4444",
  REFUNDED: "#F59E0B",
  PENDING: "#EAB308",
};

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
            <Pie data={data} dataKey="count" nameKey="status" outerRadius={110}>
              {data.map((entry) => (
                <Cell
                  key={entry.status}
                  fill={STATUS_COLORS[entry.status] || "#9CA3AF"}
                />
              ))}
            </Pie>

            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
