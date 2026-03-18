"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";

const STATUS_COLORS: Record<string, string> = {
  Paid: "#22c55e",
  Pending: "#f59e0b",
  Cancelled: "#ef4444",
  Delivered: "#3b82f6",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;

    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-800">{data.name}</p>
        <p className="text-gray-600">{data.value} orders</p>
        <p className="text-gray-500">
          ₦{data.revenue.toLocaleString()} revenue
        </p>
      </div>
    );
  }

  return null;
};

export default function OrdersStatusChart({
  orderStatus,
}: {
  orderStatus: {
    paid: { count: number; revenue: number };
    pending: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
  };
}) {
  const router = useRouter();
  const STATUS_ROUTE: Record<string, string> = {
    Paid: "/admin/orders?status=PAID",
    Pending: "/admin/orders?status=PENDING",
    Cancelled: "/admin/orders?status=CANCELLED",
    Delivered: "/admin/orders?status=DELIVERED",
  };
  const data = [
    {
      name: "Paid",
      value: orderStatus?.paid.count,
      revenue: orderStatus?.paid.revenue,
    },
    {
      name: "Pending",
      value: orderStatus?.pending.count,
      revenue: orderStatus?.pending.revenue,
    },
    {
      name: "Cancelled",
      value: orderStatus?.cancelled.count,
      revenue: orderStatus?.cancelled.revenue,
    },
    {
      name: "Delivered",
      value: orderStatus?.delivered.count,
      revenue: orderStatus?.delivered.revenue,
    },
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
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name]}
                    className="cursor-pointer"
                    onClick={() => router.push(STATUS_ROUTE[entry.name])}
                  />
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

              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-3">
          {data.map((item, index) => (
            <div
              key={item.name}
              onClick={() => router.push(STATUS_ROUTE[item.name])}
              className="flex items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 translate rounded-md px-2 py-1"
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
