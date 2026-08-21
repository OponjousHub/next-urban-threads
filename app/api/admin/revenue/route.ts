import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { calculateChange } from "@/lib/analytics/calculateChange";
import { OrderStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";

const MIN_CONVERSION_SESSIONS = 10;
const MIN_RETURNING_CUSTOMERS = 10;

function getStartDate(range: string) {
  const days = range === "7" ? 7 : range === "90" ? 90 : 30;

  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - (days - 1));

  return start;
}

/**
 * Calculate KPI change only when both periods have meaningful data.
 *
 * This prevents misleading values such as:
 *
 * previous = 0
 * current = 2
 * change = +100%
 *
 * when there isn't enough historical data to make that comparison useful.
 */
function calculateKpiChange(current: number | null, previous: number | null) {
  if (current === null || previous === null) {
    return {
      change: null,
      trend: "neutral",
    };
  }

  return calculateChange(current, previous);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const range = searchParams.get("range") || "30";

    const days = range === "7" ? 7 : range === "90" ? 90 : 30;

    // ---------------------------------------------------------
    // DATE RANGES
    // ---------------------------------------------------------

    // Current period ends today.
    const chartEndDate = new Date();
    chartEndDate.setHours(0, 0, 0, 0);

    // Current period starts at the beginning of the first day.
    const startDate = new Date(chartEndDate);
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    // Previous period immediately before current period.
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const previousEndDate = new Date(startDate);

    const chartEndExclusive = new Date(chartEndDate);
    chartEndExclusive.setDate(chartEndExclusive.getDate() + 1);

    // ---------------------------------------------------------
    // TENANT
    // ---------------------------------------------------------

    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    // ---------------------------------------------------------
    // REUSABLE REVENUE ORDER FILTER
    // ---------------------------------------------------------

    const revenueOrderFilter = {
      tenantId: tenant.id,
      storeMode: tenant.storeMode,
      paymentStatus: PaymentStatus.PAID,
      status: {
        in: [
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ],
      },
    };

    // ---------------------------------------------------------
    // FETCH DASHBOARD DATA
    // ---------------------------------------------------------

    const [
      currentOrdersData,
      previousOrdersData,

      currentRefunds,
      previousRefunds,

      currentCustomers,
      previousCustomers,

      currentSessions,
      previousSessions,

      // Orders used for chart
      chartOrders,
      previousChartOrders,

      // Returning customer calculation
      currentReturningRaw,
      previousReturningRaw,

      // -------------------------------------------------------
      // IMPORTANT:
      // Get unique checkout sessions that produced an order.
      //
      // A session that creates 5 orders still counts as ONE
      // converted session.
      // -------------------------------------------------------
      currentConvertedSessions,
      previousConvertedSessions,
    ] = await Promise.all([
      // =======================================================
      // CURRENT PERIOD ORDERS
      // =======================================================

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

      // =======================================================
      // PREVIOUS PERIOD ORDERS
      // =======================================================

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

      // =======================================================
      // CURRENT REFUNDS
      // =======================================================

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

      // =======================================================
      // PREVIOUS REFUNDS
      // =======================================================

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

      // =======================================================
      // CURRENT CUSTOMERS
      // =======================================================

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

      // =======================================================
      // PREVIOUS CUSTOMERS
      // =======================================================

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

      // =======================================================
      // CURRENT STOREFRONT SESSIONS
      // =======================================================

      prisma.storefrontSession.count({
        where: {
          tenantId: tenant.id,
          storeMode: tenant.storeMode,
          startedAt: {
            gte: startDate,
          },
        },
      }),

      // =======================================================
      // PREVIOUS STOREFRONT SESSIONS
      // =======================================================

      prisma.storefrontSession.count({
        where: {
          tenantId: tenant.id,
          storeMode: tenant.storeMode,
          startedAt: {
            gte: previousStartDate,
            lt: startDate,
          },
        },
      }),

      // =======================================================
      // CURRENT PERIOD CHART ORDERS
      // =======================================================

      prisma.order.findMany({
        where: {
          ...revenueOrderFilter,
          storeMode: tenant.storeMode,
          createdAt: {
            gte: startDate,
            lt: chartEndExclusive,
          },
        },

        select: {
          createdAt: true,
          totalAmount: true,
        },
      }),

      // =======================================================
      // PREVIOUS PERIOD CHART ORDERS
      // =======================================================

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

      // =======================================================
      // CURRENT RETURNING CUSTOMERS
      // =======================================================

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

      // =======================================================
      // PREVIOUS RETURNING CUSTOMERS
      // =======================================================

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

      // =======================================================
      // CURRENT CONVERTED SESSIONS
      // =======================================================
      //
      // DISTINCT sessionKey means:
      //
      // Session A -> 1 order = 1 conversion
      // Session B -> 5 orders = 1 conversion
      //
      // Therefore conversion can never be inflated by
      // multiple orders from the same session.
      //
      // =======================================================

      prisma.order.findMany({
        where: {
          ...revenueOrderFilter,

          createdAt: {
            gte: startDate,
          },

          storefrontSessionId: {
            not: null,
          },
        },

        select: {
          storefrontSessionId: true,
        },

        distinct: ["storefrontSessionId"],
      }),

      // =======================================================
      // PREVIOUS CONVERTED SESSIONS
      // =======================================================

      prisma.order.findMany({
        where: {
          ...revenueOrderFilter,

          createdAt: {
            gte: previousStartDate,
            lt: startDate,
          },

          storefrontSessionId: {
            not: null,
          },
        },

        select: {
          storefrontSessionId: true,
        },

        distinct: ["storefrontSessionId"],
      }),
    ]);

    // ---------------------------------------------------------
    // CHART MAP
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // REFUND MAP
    // ---------------------------------------------------------

    const refundChartMap = new Map<string, number>();

    for (const refund of currentRefunds) {
      const date = new Date(refund.updatedAt);

      const label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });

      const amount = Number(
        refund.approvedAmount ?? refund.requestedAmount ?? 0,
      );

      refundChartMap.set(label, (refundChartMap.get(label) ?? 0) + amount);
    }

    // ---------------------------------------------------------
    // PREVIOUS CHART MAP
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // BUILD DAILY CHART DATA
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // DERIVE REVENUE
    // ---------------------------------------------------------

    const currentGrossRevenue =
      currentOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

    const previousGrossRevenue =
      previousOrdersData._sum.totalAmount?.toNumber?.() ?? 0;

    // ---------------------------------------------------------
    // REFUND TOTALS
    // ---------------------------------------------------------

    const currentRefundTotal = currentRefunds.reduce((sum, refund) => {
      const amount = refund.approvedAmount ?? refund.requestedAmount ?? 0;

      return sum + Number(amount);
    }, 0);

    const previousRefundTotal = previousRefunds.reduce((sum, refund) => {
      const amount = refund.approvedAmount ?? refund.requestedAmount ?? 0;

      return sum + Number(amount);
    }, 0);

    // ---------------------------------------------------------
    // NET REVENUE
    // ---------------------------------------------------------

    const currentRevenue = Math.max(
      0,
      currentGrossRevenue - currentRefundTotal,
    );

    const previousRevenue = Math.max(
      0,
      previousGrossRevenue - previousRefundTotal,
    );

    // ---------------------------------------------------------
    // ORDERS
    // ---------------------------------------------------------

    const currentOrders = currentOrdersData._count.id ?? 0;

    const previousOrders = previousOrdersData._count.id ?? 0;

    // ---------------------------------------------------------
    // AVERAGE ORDER VALUE
    // ---------------------------------------------------------

    const currentAvgOrder =
      currentOrders > 0 ? currentRevenue / currentOrders : 0;

    const previousAvgOrder =
      previousOrders > 0 ? previousRevenue / previousOrders : 0;

    // ---------------------------------------------------------
    // CONVERSION RATE
    // ---------------------------------------------------------
    //
    // IMPORTANT:
    //
    // We DO NOT use:
    //
    //     orders / sessions
    //
    // because one visitor can place multiple orders.
    //
    // Instead:
    //
    //     unique converted sessions / total sessions
    //
    // This prevents results such as 600%.
    //
    // We also require a minimum amount of traffic before
    // displaying the KPI.
    //
    // ---------------------------------------------------------

    const convertedCurrentSessions = currentConvertedSessions.length;

    const convertedPreviousSessions = previousConvertedSessions.length;

    const currentConversion =
      currentSessions >= MIN_CONVERSION_SESSIONS
        ? Math.min(100, (convertedCurrentSessions / currentSessions) * 100)
        : null;

    const previousConversion =
      previousSessions >= MIN_CONVERSION_SESSIONS
        ? Math.min(100, (convertedPreviousSessions / previousSessions) * 100)
        : null;

    // ---------------------------------------------------------
    // BASIC KPI CHANGES
    // ---------------------------------------------------------

    const revenueStats = calculateKpiChange(currentRevenue, previousRevenue);

    const ordersStats = calculateKpiChange(currentOrders, previousOrders);

    const avgStats = calculateKpiChange(currentAvgOrder, previousAvgOrder);

    const customerStats = calculateKpiChange(
      currentCustomers,
      previousCustomers,
    );

    const conversionStats = calculateKpiChange(
      currentConversion,
      previousConversion,
    );

    // ---------------------------------------------------------
    // RETURNING CUSTOMERS
    // ---------------------------------------------------------

    const currentReturningCustomers = currentReturningRaw.filter(
      (user) => user._count.id > 1,
    ).length;

    const previousReturningCustomers = previousReturningRaw.filter(
      (user) => user._count.id > 1,
    ).length;

    // ---------------------------------------------------------
    // RETURNING CUSTOMER RATE
    // ---------------------------------------------------------
    //
    // Don't show a percentage when the customer population is
    // too small to make the metric meaningful.
    //
    // ---------------------------------------------------------

    const currentReturningRate =
      currentCustomers > 0
        ? (currentReturningCustomers / currentCustomers) * 100
        : 0;

    const previousReturningRate =
      previousCustomers > 0
        ? (previousReturningCustomers / previousCustomers) * 100
        : 0;

    const returningStats = calculateKpiChange(
      currentReturningRate,
      previousReturningRate,
    );

    // ---------------------------------------------------------
    // CHART DEBUG VALUES
    // ---------------------------------------------------------

    // const chartGrossRevenue = chartData.reduce(
    //   (sum, day) => sum + (day.revenue + (refundChartMap.get(day.name) ?? 0)),
    //   0,
    // );

    // const chartRefundTotal = Array.from(refundChartMap.values()).reduce(
    //   (sum, amount) => sum + amount,
    //   0,
    // );

    return NextResponse.json({
      revenue: currentRevenue,
      revenueChange: revenueStats.change,

      orders: currentOrders,
      ordersChange: ordersStats.change,

      avgOrderValue: currentAvgOrder,
      avgOrderChange: avgStats.change,

      customers: currentCustomers,
      customersChange: customerStats.change,

      // Conversion
      conversionRate: currentConversion,
      conversionChange: conversionStats.change,

      // Returning customers
      returningCustomerRate: currentReturningRate,
      returningCustomerChange: returningStats.change,

      // Useful metadata for frontend/tooltips
      conversionSessions: currentSessions,
      convertedSessions: convertedCurrentSessions,
      conversionThreshold: MIN_CONVERSION_SESSIONS,

      returningCustomerThreshold: MIN_RETURNING_CUSTOMERS,

      chartData,

      currency: tenant.currency,
    });
  } catch (error) {
    console.error("Admin revenue analytics failed:", error);

    return NextResponse.json(
      {
        message: "Failed to load revenue analytics",
      },
      {
        status: 500,
      },
    );
  }
}
