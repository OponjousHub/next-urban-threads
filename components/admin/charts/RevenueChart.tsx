// "use client";

"use client";

import { useState, useEffect } from "react";
import {
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  ComposedChart,
} from "recharts";
import { FiArrowDown, FiArrowUp } from "react-icons/fi";

type Trend = "up" | "down" | "neutral";

export default function RevenueChart() {
  const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
  const [range, setRange] = useState("30");

  const [revenue, setRevenue] = useState(0);
  const [orders, setOrders] = useState(0);
  const [avgOrderValue, setAvgOrderValue] = useState(0);

  const [revenueChange, setRevenueChange] = useState(0);
  const [ordersChange, setOrdersChange] = useState(0);
  const [avgOrderChange, setAvgOrderChange] = useState(0);

  const [revenueTrend, setRevenueTrend] = useState<Trend>("neutral");
  const [ordersTrend, setOrdersTrend] = useState<Trend>("neutral");
  const [avgTrend, setAvgTrend] = useState<Trend>("neutral");

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const res = await fetch(`/api/admin/revenue?range=${range}`);
      const data = await res.json();

      setRevenue(data.revenue);
      setOrders(data.orders);
      setAvgOrderValue(data.avgOrderValue);

      setRevenueChange(data.revenueChange);
      setOrdersChange(data.ordersChange);
      setAvgOrderChange(data.avgOrderChange);

      setRevenueTrend(data.revenueTrend);
      setOrdersTrend(data.ordersTrend);
      setAvgTrend(data.avgOrderTrend);

      setChartData(data.chartData);
    }

    loadData();
  }, [range]);

  function getTrendColor(trend: Trend) {
    if (trend === "up") return "text-green-600";
    if (trend === "down") return "text-red-500";
    return "text-gray-500";
  }

  function TrendIcon({ trend }: { trend: Trend }) {
    if (trend === "up") return <FiArrowUp size={11} />;
    if (trend === "down") return <FiArrowDown size={11} />;
    return <span className="w-[11px]" />;
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
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
        {/* Revenue */}
        <div>
          <p className="text-xs text-gray-500">Revenue</p>
          <p className="text-xl font-bold">${revenue.toLocaleString()}</p>

          <span
            className={`flex items-center text-xs font-medium ${getTrendColor(
              revenueTrend,
            )}`}
          >
            <TrendIcon trend={revenueTrend} />
            {Math.abs(revenueChange).toFixed(1)}% vs last period
          </span>
        </div>

        {/* Orders */}
        <div>
          <p className="text-xs text-gray-500">Orders</p>
          <p className="text-xl font-bold">{orders}</p>

          <span
            className={`flex items-center text-xs font-medium ${getTrendColor(
              ordersTrend,
            )}`}
          >
            <TrendIcon trend={ordersTrend} />
            {Math.abs(ordersChange).toFixed(1)}% vs last period
          </span>
        </div>

        {/* Avg Order */}
        <div>
          <p className="text-xs text-gray-500">Avg Order</p>
          <p className="text-xl font-bold">${avgOrderValue.toFixed(2)}</p>

          <span
            className={`flex items-center text-xs font-medium ${getTrendColor(
              avgTrend,
            )}`}
          >
            <TrendIcon trend={avgTrend} />
            {Math.abs(avgOrderChange).toFixed(1)}% vs last period
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
          <ComposedChart data={chartData}>
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
              allowDecimals={false}
            />

            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

            <Tooltip
              contentStyle={{
                borderRadius: "10px",
                border: "none",
                boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
              }}
            />

            {/* Previous period */}
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

// import { useState, useEffect } from "react";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Area,
//   ComposedChart,
// } from "recharts";
// import { FiArrowDown, FiArrowUp, FiTrendingDown } from "react-icons/fi";

// export default function RevenueChart() {
//   const [metric, setMetric] = useState<"revenue" | "orders">("revenue");
//   const [range, setRange] = useState("30");
//   const [revenueData, setRevenueData] = useState<number>();
//   const [totalOrders, setTotalOrders] = useState<number>();
//   const [revenueChange, setRevenueChange] = useState<number>(0);
//   const [orderChange, setOrderChange] = useState<number>(0);
//   const [avgOrderChange, setAvgOrderChange] = useState<number>(0);
//   const [chartData, setChartData] = useState<any[]>([]);

//   const avgOrder =
//     totalOrders && totalOrders > 0 ? (revenueData ?? 0) / totalOrders : 0;

//   useEffect(() => {
//     async function loadData() {
//       const res = await fetch(`/api/admin/revenue?range=${range}`);
//       const data = await res.json();
//       console.log(data);
//       setRevenueData(data.revenue);
//       setTotalOrders(data.orders);
//       setRevenueChange(data.revenueChange);
//       setChartData(data.chartData);
//       setOrderChange(data.ordersChange);
//       setAvgOrderChange(data.avgOrderChange);
//     }

//     loadData();
//   }, [range]);
//   console.log("RANGE-----------", orderChange);

//   return (
//     <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h3 className="text-lg font-semibold">Revenue Overview</h3>
//           <p className="text-xs text-gray-500">Compare performance over time</p>
//         </div>

//         <select
//           value={range}
//           onChange={(e) => setRange(e.target.value)}
//           className="text-sm border border-gray-200 rounded-lg px-3 py-1"
//         >
//           <option value="7">Last 7 days</option>
//           <option value="30">Last 30 days</option>
//           <option value="90">Last 3 months</option>
//         </select>
//       </div>

//       {/* Summary Stats */}
//       <div className="grid grid-cols-3 gap-6 mb-6">
//         <div>
//           <p className="text-xs text-gray-500">Revenue</p>
//           <p className="text-xl font-bold">${revenueData}</p>
//           <span className="flex items-center text-xs text-green-600 font-medium">
//             <span
//               className={`flex items-center text-xs font-medium ${
//                 revenueChange >= 0 ? "text-green-600" : "text-red-500"
//               }`}
//             >
//               {revenueChange >= 0 ? (
//                 <FiArrowUp size={11} />
//               ) : (
//                 <FiArrowDown size={11} />
//               )}
//               {Math.abs(revenueChange).toFixed(1)}% vs last period
//             </span>
//           </span>
//         </div>

//         <div>
//           <p className="text-xs text-gray-500">Orders</p>
//           <p className="text-xl font-bold">{totalOrders}</p>
//           <span className="flex items-center text-xs text-green-600 font-medium">
//             <span
//               className={`flex items-center text-xs font-medium ${
//                 orderChange >= 0 ? "text-green-600" : "text-red-500"
//               }`}
//             >
//               {orderChange >= 0 ? (
//                 <FiArrowUp size={11} />
//               ) : (
//                 <FiArrowDown size={11} />
//               )}
//               {Math.abs(orderChange).toFixed(1)}% vs last period
//             </span>
//           </span>
//         </div>

//         <div>
//           <p className="text-xs text-gray-500">Avg Order</p>
//           <p className="text-xl font-bold">${avgOrder.toFixed(2)}</p>
//           <span
//             className={`flex items-center text-xs font-medium ${
//               avgOrderChange >= 0 ? "text-green-600" : "text-red-500"
//             }`}
//           >
//             {avgOrderChange >= 0 ? (
//               <FiArrowUp size={11} />
//             ) : (
//               <FiArrowDown size={11} />
//             )}
//             {Math.abs(avgOrderChange).toFixed(1)}% vs last period
//           </span>
//         </div>
//       </div>

//       {/* Metric Toggle */}
//       <div className="flex bg-gray-100 rounded-lg p-1 w-fit mb-4">
//         <button
//           onClick={() => setMetric("revenue")}
//           className={`px-3 py-1 text-sm rounded-md ${
//             metric === "revenue" ? "bg-white shadow-sm" : "text-gray-500"
//           }`}
//         >
//           Revenue
//         </button>

//         <button
//           onClick={() => setMetric("orders")}
//           className={`px-3 py-1 text-sm rounded-md ${
//             metric === "orders" ? "bg-white shadow-sm" : "text-gray-500"
//           }`}
//         >
//           Orders
//         </button>
//       </div>

//       {/* Chart */}
//       <div className="h-72">
//         <ResponsiveContainer width="100%" height="100%">
//           <ComposedChart data={chartData}>
//             <defs>
//               <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
//                 <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
//                 <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
//               </linearGradient>
//             </defs>

//             <CartesianGrid strokeDasharray="3 3" opacity={0.2} />

//             <XAxis
//               dataKey="name"
//               axisLine={false}
//               tickLine={false}
//               tick={{ fontSize: 12 }}
//             />

//             <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />

//             <Tooltip
//               contentStyle={{
//                 borderRadius: "10px",
//                 border: "none",
//                 boxShadow: "0 6px 20px rgba(0,0,0,0.1)",
//               }}
//             />

//             {/* Previous period line */}
//             <Line
//               type="monotone"
//               dataKey="prev"
//               stroke="#cbd5f5"
//               strokeWidth={2}
//               strokeDasharray="5 5"
//               dot={false}
//             />

//             {/* Main metric */}
//             <Area
//               type="monotone"
//               dataKey={metric}
//               stroke="#6366F1"
//               strokeWidth={3}
//               fill="url(#revenueFill)"
//               dot={{ r: 4 }}
//               activeDot={{ r: 6 }}
//             />
//           </ComposedChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// }
