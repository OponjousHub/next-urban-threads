import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { calculateChange } from "@/lib/analytics/calculateChange";

function getStartDate(range: string) {
  const now = new Date();
  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  const start = new Date();
  start.setDate(now.getDate() - days);

  return start;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30";

  const startDate = getStartDate(range);
  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(startDate.getDate() - days);

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found");

  const current = await prisma.order.aggregate({
    where: {
      tenantId: tenant.id,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: {
        gte: startDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const previous = await prisma.order.aggregate({
    where: {
      tenantId: tenant.id,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: {
        gte: previousStartDate,
        lt: startDate,
      },
    },
    _sum: {
      totalAmount: true,
    },
    _count: {
      id: true,
    },
  });

  const ordersForChart = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      createdAt: {
        gte: startDate,
      },
    },
    select: {
      totalAmount: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // Convert the orders into daily buckets.

  const chartMap: Record<
    string,
    { name: string; revenue: number; orders: number }
  > = {};

  ordersForChart.forEach((order) => {
    const date = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    if (!chartMap[date]) {
      chartMap[date] = {
        name: date,
        revenue: 0,
        orders: 0,
      };
    }

    chartMap[date].revenue += order.totalAmount.toNumber();
    chartMap[date].orders += 1;
  });

  let chartData = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    chartData.push(
      chartMap[label] || {
        name: label,
        revenue: 0,
        orders: 0,
      },
    );
  }

  const currentRevenue = current._sum.totalAmount?.toNumber?.() ?? 0;
  const currentOrders = current._count.id ?? 0;
  const previousRevenue = previous._sum.totalAmount?.toNumber?.() ?? 0;
  const previousOrders = previous._count.id ?? 0;

  const currentAvgOrder =
    currentOrders > 0 ? currentRevenue / currentOrders : 0;
  const previousAvgOrder =
    previousOrders > 0 ? previousRevenue / previousOrders : 0;

  const revenueStats = calculateChange(currentRevenue, previousRevenue);
  const ordersStats = calculateChange(currentOrders, previousOrders);
  const avgStats = calculateChange(currentAvgOrder, previousAvgOrder);

  return Response.json({
    revenue: currentRevenue,
    revenueChange: revenueStats.change,
    revenueTrend: revenueStats.trend,

    orders: currentOrders,
    ordersChange: ordersStats.change,
    ordersTrend: ordersStats.trend,

    avgOrderValue: currentAvgOrder,
    avgOrderChange: avgStats.change,
    avgOrderTrend: avgStats.trend,

    chartData,
  });
}
