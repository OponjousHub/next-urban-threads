"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/formatCurrency";
import { useTenant } from "@/store/tenant-provider-context";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#6366f1",
  Shipped: "#3b82f6",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

const CustomTooltip = ({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: any[];
  currency: string;
}) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const {tenant} = useTenant()

    return (
      <div className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 text-sm">
        <p className="font-medium text-gray-800">{data.name}</p>
        <p className="text-gray-600">{data.value} orders</p>
        <p className="text-gray-500">
          {formatCurrency(data.revenue, tenant.currency)} revenue
        </p>
      </div>
    );
  }

  return null;
};

export default function OrdersStatusChart({
  orderStatus,
  currency,
}: {
  orderStatus: {
    pending: { count: number; revenue: number };
    processing: { count: number; revenue: number };
    shipped: { count: number; revenue: number };
    delivered: { count: number; revenue: number };
    cancelled: { count: number; revenue: number };
  };
  currency: string;
}) {
  const router = useRouter();
  const STATUS_ROUTE: Record<string, string> = {
    Pending: "/admin/orders?status=PENDING",
    Processing: "/admin/orders?status=PROCESSING",
    Shipped: "/admin/orders?status=SHIPPED",
    Delivered: "/admin/orders?status=DELIVERED",
    Cancelled: "/admin/orders?status=CANCELLED",
  };
  const data = [
    {
      name: "Pending",
      value: orderStatus?.pending?.count ?? 0,
      revenue: orderStatus?.pending?.revenue ?? 0,
    },
    {
      name: "Processing",
      value: orderStatus?.processing?.count ?? 0,
      revenue: orderStatus?.processing?.revenue ?? 0,
    },
    {
      name: "Shipped",
      value: orderStatus?.shipped?.count ?? 0,
      revenue: orderStatus?.shipped?.revenue ?? 0,
    },
    {
      name: "Delivered",
      value: orderStatus?.delivered?.count ?? 0,
      revenue: orderStatus?.delivered?.revenue ?? 0,
    },
    {
      name: "Cancelled",
      value: orderStatus?.cancelled?.count ?? 0,
      revenue: orderStatus?.cancelled?.revenue ?? 0,
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
              <Tooltip content={<CustomTooltip currency={currency} />} />{" "}
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

              <span className="text-sm font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
