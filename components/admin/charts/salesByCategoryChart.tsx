"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { FiBarChart2 } from "react-icons/fi";

interface Props {
  data: {
    category: string;
    sales: number;
  }[];
}

export default function SalesByCategoryChart({ data }: Props) {
  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <h3 className="mb-6 text-lg font-semibold text-gray-900">
        Sales by Category
      </h3>

      {!hasData ? (
        /* Empty State */
        <div className="flex min-h-[256px] flex-col items-center justify-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
            <FiBarChart2 className="text-2xl" />
          </div>

          <h4 className="font-semibold text-gray-900">No sales data yet</h4>

          <p className="mt-1 max-w-xs text-sm text-gray-500">
            Sales by category will appear here once your store receives orders.
          </p>
        </div>
      ) : (
        /* Chart */
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <YAxis
                dataKey="category"
                type="category"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />

              <Tooltip
                contentStyle={{
                  borderRadius: "10px",
                  border: "none",
                  boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
                }}
              />

              <Bar
                dataKey="sales"
                fill="var(--color-primary)"
                radius={[6, 6, 6, 6]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
