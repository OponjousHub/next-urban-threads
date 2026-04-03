import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { calculateChange } from "@/lib/analytics/calculateChange";
import { OrderStatus } from "@prisma/client";

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

  const [
    currentOrdersData,
    previousOrdersData,
    currentCustomers,
    previousCustomers,
    groupedOrders,
    currentReturningRaw,
    previousReturningRaw,
  ] = await Promise.all([
    // Current period orders
    prisma.order.aggregate({
      where: {
        tenantId: tenant.id,
        status: {
          in: [
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.PENDING,
            OrderStatus.PROCESSING,
          ],
        },
        createdAt: { gte: startDate },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Previous period orders
    prisma.order.aggregate({
      where: {
        tenantId: tenant.id,
        status: {
          in: [
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
            OrderStatus.CANCELLED,
            OrderStatus.PENDING,
            OrderStatus.PROCESSING,
          ],
        },
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _sum: { totalAmount: true },
      _count: { id: true },
    }),

    // Current customers
    prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: "USER",
        createdAt: { gte: startDate },
      },
    }),

    // Previous customers
    prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: "USER",
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
    }),

    // Chart data
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

    // Current returning customers
    prisma.order.groupBy({
      by: ["userId"],
      where: {
        tenantId: tenant.id,
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
    }),

    // Previous returning customers
    prisma.order.groupBy({
      by: ["userId"],
      where: {
        tenantId: tenant.id,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      _count: {
        id: true,
      },
    }),
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

  // DERIVING VALUES FROM PROMISE>ALL VALUES

  const currentRevenue = currentOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

  const previousRevenue =
    previousOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

  const currentOrders = currentOrdersData._count.id ?? 0;
  const previousOrders = previousOrdersData._count.id ?? 0;

  // DERIVE KPIs

  const currentAvgOrder =
    currentOrders > 0 ? currentRevenue / currentOrders : 0;

  const previousAvgOrder =
    previousOrders > 0 ? previousRevenue / previousOrders : 0;

  // CALCULATE CONVERSION RATE

  const currentConversion =
    currentCustomers > 0 ? (currentOrders / currentCustomers) * 100 : 0;

  const previousConversion =
    previousCustomers > 0 ? (previousOrders / previousCustomers) * 100 : 0;

  const revenueStats = calculateChange(currentRevenue, previousRevenue);
  const ordersStats = calculateChange(currentOrders, previousOrders);
  const avgStats = calculateChange(currentAvgOrder, previousAvgOrder);

  const customerStats = calculateChange(currentCustomers, previousCustomers);

  const conversionStats = calculateChange(
    currentConversion,
    previousConversion,
  );

  // Calculating returning customers - extracting only customers with more than 1 order

  const currentReturningCustomers = currentReturningRaw.filter(
    (u) => u._count.id > 1,
  ).length;

  const previousReturningCustomers = previousReturningRaw.filter(
    (u) => u._count.id > 1,
  ).length;

  // Convert to rate (percentage)

  const currentReturningRate =
    currentCustomers > 0
      ? (currentReturningCustomers / currentCustomers) * 100
      : 0;

  const previousReturningRate =
    previousCustomers > 0
      ? (previousReturningCustomers / previousCustomers) * 100
      : 0;

  // Calculate returning customer change
  const returningStats = calculateChange(
    currentReturningRate,
    previousReturningRate,
  );
  return Response.json({
    revenue: currentRevenue,
    revenueChange: revenueStats.change,

    orders: currentOrders,
    ordersChange: ordersStats.change,

    avgOrderValue: currentAvgOrder,
    avgOrderChange: avgStats.change,

    customers: currentCustomers,
    customersChange: customerStats.change,

    conversionRate: currentConversion,
    conversionChange: conversionStats.change,

    returningCustomerRate: currentReturningRate,
    returningCustomerChange: returningStats.change,

    chartData,
  });
}
