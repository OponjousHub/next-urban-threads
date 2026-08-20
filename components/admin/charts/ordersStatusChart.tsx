"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

import { useRouter } from "next/navigation";

import { formatCurrency } from "@/lib/formatCurrency";

const STATUS_COLORS: Record<string, string> = {
  Pending: "#f59e0b",
  Processing: "#6366f1",
  Shipped: "#3b82f6",
  Delivered: "#22c55e",
  Cancelled: "#ef4444",
};

type OrderStatusData = {
  pending: {
    count: number;
    revenue: number;
  };
  processing: {
    count: number;
    revenue: number;
  };
  shipped: {
    count: number;
    revenue: number;
  };
  delivered: {
    count: number;
    revenue: number;
  };
  cancelled: {
    count: number;
    revenue: number;
  };
};

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      name: string;
      value: number;
      revenue: number;
    };
  }>;
  currency: string;
};

function CustomTooltip({ active, payload, currency }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-3 text-sm shadow-sm">
      <p className="font-medium text-gray-800">{data.name}</p>

      <p className="text-gray-600">
        {data.value} {data.value === 1 ? "order" : "orders"}
      </p>

      <p className="text-gray-500">
        {formatCurrency(data.revenue, currency)} revenue
      </p>
    </div>
  );
}

export default function OrdersStatusChart({
  orderStatus,
  currency,
}: {
  orderStatus: OrderStatusData;
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
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      {/* Header */}
      <h3 className="mb-6 text-lg font-semibold">Order Status</h3>

      <div className="flex items-center gap-6">
        {/* Chart */}
        <div className="h-40 w-40 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={50}
                outerRadius={70}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={STATUS_COLORS[entry.name]}
                    className="cursor-pointer"
                    onClick={() => router.push(STATUS_ROUTE[entry.name])}
                  />
                ))}

                {/* Center total */}
                <text
                  x="50%"
                  y="46%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-800 text-lg font-semibold"
                >
                  {totalOrders}
                </text>

                <text
                  x="50%"
                  y="60%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400 text-xs"
                >
                  Orders
                </text>
              </Pie>

              <Tooltip content={<CustomTooltip currency={currency} />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-1 flex-col gap-3">
          {data.map((item) => (
            <button
              key={item.name}
              type="button"
              onClick={() => router.push(STATUS_ROUTE[item.name])}
              className="flex w-full items-center justify-between gap-4 rounded-md px-2 py-1 text-left transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: STATUS_COLORS[item.name],
                  }}
                />

                <span className="text-sm text-gray-600">{item.name}</span>
              </div>

              <span className="text-sm font-medium text-gray-900">
                {item.value}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
