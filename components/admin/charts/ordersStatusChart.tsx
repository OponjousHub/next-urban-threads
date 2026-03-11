"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const STATUS_COLORS: Record<string, string> = {
  Paid: "#22c55e",
  Pending: "#f59e0b",
  Cancelled: "#ef4444",
  Delivered: "#3b82f6",
};

export default function OrdersStatusChart({
  orderStatus,
}: {
  orderStatus: {
    paid: number;
    pending: number;
    cancelled: number;
    delivered: number;
  };
}) {
  const data = [
    { name: "Paid", value: orderStatus.paid },
    { name: "Pending", value: orderStatus.pending },
    { name: "Cancelled", value: orderStatus.cancelled },
    { name: "Delivered", value: orderStatus.delivered },
  ].filter((item) => item.value > 0);

  const totalOrders = data.reduce((sum, item) => sum + item.value, 0);
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <h3 className="text-lg font-semibold mb-6">Order Status</h3>

      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="w-40 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={STATUS_COLORS[entry.name]} />
                ))}

                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-lg font-semibold fill-gray-800"
                >
                  {totalOrders}
                </text>

                <text
                  x="50%"
                  y="62%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-400"
                >
                  Orders
                </text>
              </Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.name] }}
                />
                <span className="text-sm text-gray-600">{item.name}</span>
              </div>

              <span className="text-sm font-medium">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
