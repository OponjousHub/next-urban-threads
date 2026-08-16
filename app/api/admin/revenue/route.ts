import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { calculateChange } from "@/lib/analytics/calculateChange";
import { OrderStatus, PaymentStatus } from "@prisma/client";

function getStartDate(range: string) {
  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const range = searchParams.get("range") || "30";

  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  // Use calendar-day boundaries for both KPI and chart calculations.
  // This keeps the KPI period and chart period perfectly aligned.
  const chartEndDate = new Date();
  chartEndDate.setHours(0, 0, 0, 0);

  const startDate = new Date(chartEndDate);
  startDate.setDate(startDate.getDate() - (days - 1));
  startDate.setHours(0, 0, 0, 0);

  // Previous period immediately before the current period.
  const previousStartDate = new Date(startDate);
  previousStartDate.setDate(previousStartDate.getDate() - days);

  const previousEndDate = new Date(startDate);

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found");

  // Add a reusable filter
  const revenueOrderFilter = {
    tenantId: tenant.id,
    storeMode: tenant.storeMode,
    paymentStatus: PaymentStatus.PAID,
    status: {
      in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
    },
  };

  const [
    currentOrdersData,
    previousOrdersData,
    currentRefunds,
    previousRefunds,
    currentCustomers,
    previousCustomers,
    chartOrders,
    previousChartOrders,
    currentReturningRaw,
    previousReturningRaw,
  ] = await Promise.all([
    // Current period orders
    prisma.order.aggregate({
      where: {
        ...revenueOrderFilter,
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

    // Previous period orders
    prisma.order.aggregate({
      where: {
        ...revenueOrderFilter,
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

    // Current period completed refunds
    prisma.refundRequest.findMany({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        status: "REFUNDED",
        updatedAt: {
          gte: startDate,
        },
      },
      select: {
        approvedAmount: true,
        requestedAmount: true,
        updatedAt: true,
      },
    }),

    // Previous period completed refunds
    prisma.refundRequest.findMany({
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        status: "REFUNDED",
        updatedAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        approvedAmount: true,
        requestedAmount: true,
        updatedAt: true,
      },
    }),

    // Current customers
    //
    // A customer belongs in this dashboard period only if they
    // actually have a qualifying order in the current store mode.
    prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: "USER",
        orders: {
          some: {
            ...revenueOrderFilter,
            createdAt: {
              gte: startDate,
            },
          },
        },
      },
    }),

    // Previous customers
    //
    // Same logic as current customers, but for the previous
    // comparison period.
    prisma.user.count({
      where: {
        tenantId: tenant.id,
        role: "USER",
        orders: {
          some: {
            ...revenueOrderFilter,
            createdAt: {
              gte: previousStartDate,
              lt: startDate,
            },
          },
        },
      },
    }),

    // Current period chart data
    prisma.order.findMany({
      where: {
        ...revenueOrderFilter,
        createdAt: {
          gte: startDate,
          lt: new Date(chartEndDate.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    }),

    // Previous period chart data
    prisma.order.findMany({
      where: {
        ...revenueOrderFilter,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
    }),

    // Current returning customers
    prisma.order.groupBy({
      by: ["userId"],
      where: {
        tenantId: tenant.id,
        storeMode: tenant.storeMode,
        createdAt: {
          gte: startDate,
        },
        paymentStatus: PaymentStatus.PAID,
        status: {
          in: [
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
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
        storeMode: tenant.storeMode,
        createdAt: {
          gte: previousStartDate,
          lt: startDate,
        },
        paymentStatus: PaymentStatus.PAID,
        status: {
          in: [
            OrderStatus.PROCESSING,
            OrderStatus.SHIPPED,
            OrderStatus.DELIVERED,
          ],
        },
      },
      _count: {
        id: true,
      },
    }),
  ]);

  // Creating the chartMap
  const chartMap = new Map<
    string,
    {
      name: string;
      revenue: number;
      orders: number;
    }
  >();

  for (const order of chartOrders) {
    const label = new Date(order.createdAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const existing = chartMap.get(label);

    const revenue = order.totalAmount.toNumber();

    if (existing) {
      existing.revenue += revenue;
      existing.orders += 1;
    } else {
      chartMap.set(label, {
        name: label,
        revenue,
        orders: 1,
      });
    }
  }

  // Build a refund map for the current period
  const refundChartMap = new Map<string, number>();

  for (const refund of currentRefunds) {
    const date = new Date(refund.updatedAt);

    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const amount = Number(refund.approvedAmount ?? refund.requestedAmount ?? 0);

    refundChartMap.set(label, (refundChartMap.get(label) ?? 0) + amount);
  }

  // Build a previous-period chart map
  const previousChartMap = new Map<
    string,
    {
      revenue: number;
      orders: number;
    }
  >();

  for (const order of previousChartOrders) {
    const date = new Date(order.createdAt);

    // Move previous-period dates forward by the selected range
    date.setDate(date.getDate() + days);

    const label = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const revenue = order.totalAmount.toNumber();

    const existing = previousChartMap.get(label);

    if (existing) {
      existing.revenue += revenue;
      existing.orders += 1;
    } else {
      previousChartMap.set(label, {
        revenue,
        orders: 1,
      });
    }
  }

  // Build every calendar day represented by the current period.
  //
  // The KPI uses a rolling period starting at startDate.
  // For the chart, we normalize the first date to the beginning
  // of that calendar day so that today's orders/refunds are not
  // accidentally left outside the chart.

  const chartData = [];

  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);

    const label = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    const current = chartMap.get(label);
    const previous = previousChartMap.get(label);

    const grossRevenueForDay = current?.revenue ?? 0;
    const refundsForDay = refundChartMap.get(label) ?? 0;

    const netRevenueForDay = grossRevenueForDay - refundsForDay;

    chartData.push({
      name: label,
      revenue: netRevenueForDay,
      orders: current?.orders ?? 0,
      prevRevenue: previous?.revenue ?? 0,
      prevOrders: previous?.orders ?? 0,
    });
  }
  // DERIVING VALUES FROM PROMISE>ALL VALUES

  const currentGrossRevenue =
    currentOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

  const previousGrossRevenue =
    previousOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

  const currentRefundTotal = currentRefunds.reduce((sum, refund) => {
    const amount = refund.approvedAmount ?? refund.requestedAmount ?? 0;

    return sum + Number(amount);
  }, 0);

  const previousRefundTotal = previousRefunds.reduce((sum, refund) => {
    const amount = refund.approvedAmount ?? refund.requestedAmount ?? 0;

    return sum + Number(amount);
  }, 0);

  const currentRevenue = Math.max(0, currentGrossRevenue - currentRefundTotal);

  const previousRevenue = Math.max(
    0,
    previousGrossRevenue - previousRefundTotal,
  );

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
  const chartGrossRevenue = chartData.reduce(
    (sum, day) => sum + (day.revenue + (refundChartMap.get(day.name) ?? 0)),
    0,
  );

  const chartRefundTotal = Array.from(refundChartMap.values()).reduce(
    (sum, amount) => sum + amount,
    0,
  );

  console.log("===== CHART VS KPI DEBUG =====");
  console.log("KPI currentRevenue:", currentRevenue);
  console.log("KPI currentGrossRevenue:", currentGrossRevenue);
  console.log("KPI currentRefundTotal:", currentRefundTotal);

  console.log("Chart gross revenue:", chartGrossRevenue);
  console.log("Chart refund total:", chartRefundTotal);
  console.log(
    "Chart net revenue:",
    chartData.reduce((sum, day) => sum + day.revenue, 0),
  );

  console.log(
    "Difference:",
    chartData.reduce((sum, day) => sum + day.revenue, 0) - currentRevenue,
  );

  console.log("==============================");

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

    currency: tenant.currency,
  });
}
