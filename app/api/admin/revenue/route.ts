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

  const [current, previous, groupedOrders] = await Promise.all([
    prisma.order.aggregate({
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
    }),

    prisma.order.aggregate({
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
    }),

    prisma.$queryRaw<{ date: Date; revenue: number; orders: bigint }[]>`
  SELECT
    DATE("createdAt") as date,
    SUM("totalAmount") as revenue,
    COUNT(*) as orders
  FROM "Order"
  WHERE
    "tenantId" = ${tenant.id}
    AND "status" IN ('PAID','SHIPPED','DELIVERED')
    AND "createdAt" >= ${startDate}
  GROUP BY DATE("createdAt")
  ORDER BY DATE("createdAt") ASC
  `,
  ]);

  // Creating the chartMap
  const chartMap: Record<
    string,
    { name: string; revenue: number; orders: number }
  > = {};

  groupedOrders.forEach((row) => {
    const label = new Date(row.date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    chartMap[label] = {
      name: label,
      revenue: Number(row.revenue),
      orders: Number(row.orders),
    };
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
