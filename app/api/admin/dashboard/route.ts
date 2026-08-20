import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getActivities } from "@/lib/analytics/getActivities";
import { getLowStockProducts } from "@/lib/data/products";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Default tenant not found" },
        { status: 404 },
      );
    }

    /*
     * ---------------------------------------------------------
     * Financially valid orders
     * ---------------------------------------------------------
     *
     * For the single-vendor dashboard:
   
     */
    const revenueOrderFilter = {
      tenantId: tenant.id,
      storeMode: tenant.storeMode,
      paymentStatus: PaymentStatus.PAID,
      status: {
        in: [
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
        ],
      },
    };

    /*
     * ---------------------------------------------------------
     * Dates
     * ---------------------------------------------------------
     */
    const now = new Date();

    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    /*
     * ---------------------------------------------------------
     * Dashboard queries
     * ---------------------------------------------------------
     *
     * These queries do not depend on each other, so run them
     * concurrently instead of waiting for them one by one.
     */
    const [
      revenueAggregate,
      refundedRequests,
      totalCustomers,
      newCustomersToday,
      lowStock,
      recentOrders,
      topOrderItems,
      statusStats,
      categoryOrderItems,
      activities,
    ] = await Promise.all([
      /*
       * Total revenue
       */
      prisma.order.aggregate({
        where: revenueOrderFilter,

        _sum: {
          totalAmount: true,
        },
        _count: {
          id: true,
        },
      }),

      /*
       * Completed refunds
       *
       * Only REFUNDED refunds reduce dashboard revenue.
       * REQUESTED / APPROVED / PROCESSING / FAILED / REJECTED /
       * CANCELLED do not reduce revenue.
       */

      prisma.refundRequest.findMany({
        where: {
          tenantId: tenant.id,
          storeMode: tenant.storeMode,
          status: "REFUNDED",
        },
        select: {
          id: true,
          orderId: true,
          approvedAmount: true,
          requestedAmount: true,
          items: {
            select: {
              productId: true,
              quantity: true,
              priceAtPurchase: true,
            },
          },
          order: {
            select: {
              status: true,
            },
          },
        },
      }),

      /*
       * Total customers
       */
      prisma.user.count({
        where: {
          tenantId: tenant.id,
          role: "USER",
        },
      }),

      /*
       * New customers today
       */
      prisma.user.count({
        where: {
          tenantId: tenant.id,
          role: "USER",
          createdAt: {
            gte: startOfToday,
          },
        },
      }),

      /*
       * Low-stock products
       */
      getLowStockProducts(tenant.id),

      /*
       * Recent orders
       */
      prisma.order.findMany({
        where: {
          ...revenueOrderFilter,
          // storeMode: tenant.storeMode,
        },
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          totalAmount: true,
          status: true,
          paymentStatus: true,
          createdAt: true,
          customerEmail: true,
          user: {
            select: {
              name: true,
              email: true,
            },
          },
        },
      }),

      /*
       * Top-selling products
       *
       * We intentionally fetch order items instead of using
       * groupBy because product revenue requires:
       *
       * quantity × unit price
       */
      prisma.orderItem.findMany({
        where: {
          tenantId: tenant.id,

          // Only order items belonging to financially valid
          // orders in the current store mode.
          order: revenueOrderFilter,

          // Explicitly scope the product itself.
          product: {
            tenantId: tenant.id,
            storeMode: tenant.storeMode,
            deletedAt: null,
          },
        },

        select: {
          productId: true,
          quantity: true,
          price: true,

          product: {
            select: {
              id: true,
              name: true,
              images: true,
              storeMode: true,
            },
          },
        },
      }),

      /*
       * Order status breakdown
       */
      prisma.order.groupBy({
        by: ["status"],
        where: {
          tenantId: tenant.id,
        },
        _count: {
          id: true,
        },
        _sum: {
          totalAmount: true,
        },
      }),

      /*
       * Sales by category
       *
       * We keep both units and revenue so the UI can decide
       * which metric to emphasize.
       */
      prisma.orderItem.findMany({
        where: {
          tenantId: tenant.id,
          order: revenueOrderFilter,
        },
        select: {
          quantity: true,
          price: true,
          product: {
            select: {
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
      }),

      /*
       * Activity feed
       */
      getActivities(tenant.id),
    ]);

    /*
     * ---------------------------------------------------------
     * Financial Summary
     * ---------------------------------------------------------
     *
     * totalAmount represents the original order value.
     *
     * Completed refunds are deducted separately so that we
     * preserve the historical order amount in the database.
     */
    const grossRevenue = revenueAggregate._sum.totalAmount?.toNumber?.() ?? 0;

    const totalOrders = revenueAggregate._count.id ?? 0;

    const totalRefunds = refundedRequests.reduce((sum, refund) => {
      const amount = refund.approvedAmount ?? refund.requestedAmount ?? 0;

      return sum + Number(amount);
    }, 0);

    const totalRevenue = Math.max(0, grossRevenue - totalRefunds);

    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    /*
     * ---------------------------------------------------------
     * Recent orders
     * ---------------------------------------------------------
     */
    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: order.user?.name || "Guest Customer",
      email: order.user?.email || "No email",
      amount: Number(order.totalAmount),
      status: order.status,
      paymentStatus: order.paymentStatus,
      date: order.createdAt,
    }));

    /*
     * ---------------------------------------------------------
     * Top products
     * ---------------------------------------------------------
     */
    const productMap = new Map<
      string,
      {
        id: string;
        name: string;
        image: string;
        sales: number;
        revenue: number;
      }
    >();

    for (const item of topOrderItems) {
      const existing = productMap.get(item.productId);

      const quantity = item.quantity;
      const revenue = item.price.toNumber() * quantity;

      if (existing) {
        existing.sales += quantity;
        existing.revenue += revenue;
      } else {
        productMap.set(item.productId, {
          id: item.productId,
          name: item.product.name,
          image: item.product.images?.[0] || "/placeholder.png",
          sales: quantity,
          revenue,
        });
      }
    }

    const topProducts = Array.from(productMap.values())
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 4);

    /*
     * ---------------------------------------------------------
     * Order status
     * ---------------------------------------------------------
     */
    const orderStatus = {
      pending: {
        count: 0,
        revenue: 0,
      },
      processing: {
        count: 0,
        revenue: 0,
      },
      shipped: {
        count: 0,
        revenue: 0,
      },
      delivered: {
        count: 0,
        revenue: 0,
      },
      cancelled: {
        count: 0,
        revenue: 0,
      },
    };

    for (const row of statusStats) {
      const count = row._count.id ?? 0;
      const revenue = row._sum.totalAmount?.toNumber?.() ?? 0;

      switch (row.status) {
        case OrderStatus.PENDING:
          orderStatus.pending = { count, revenue };
          break;

        case OrderStatus.PROCESSING:
          orderStatus.processing = { count, revenue };
          break;

        case OrderStatus.SHIPPED:
          orderStatus.shipped = { count, revenue };
          break;

        case OrderStatus.DELIVERED:
          orderStatus.delivered = { count, revenue };
          break;

        case OrderStatus.CANCELLED:
          orderStatus.cancelled = { count, revenue };
          break;
      }
    }

    /*
     * ---------------------------------------------------------
     * Sales by category
     * ---------------------------------------------------------
     */
    const categoryMap = new Map<
      string,
      {
        category: string;
        sales: number;
        revenue: number;
      }
    >();

    for (const item of categoryOrderItems) {
      const category = item.product.category?.name || "Other";
      const sales = item.quantity;
      const revenue = item.price.toNumber() * item.quantity;

      const existing = categoryMap.get(category);

      if (existing) {
        existing.sales += sales;
        existing.revenue += revenue;
      } else {
        categoryMap.set(category, {
          category,
          sales,
          revenue,
        });
      }
    }

    const salesByCategory = Array.from(categoryMap.values()).sort(
      (a, b) => b.revenue - a.revenue,
    );

    /*
     * ---------------------------------------------------------
     * Response
     * ---------------------------------------------------------
     */
    console.log("TOTAL REVENUE", totalRevenue);
    console.log("TOTAL REFUNDS", totalRefunds);
    console.log("averageOrderValue", averageOrderValue);
    console.log("grossRevenue", grossRevenue);
    return NextResponse.json({
      storeMode: tenant.storeMode,
      currency: tenant.currency,
      timezone: tenant.timezone,

      summary: {
        totalRevenue,
        grossRevenue,
        totalRefunds,
        totalOrders,
        averageOrderValue,
        totalCustomers,
        newCustomersToday,
      },

      orderStatus,

      formattedRecentOrders,

      topProducts,

      salesByCategory,

      lowStock,

      activities,
    });
  } catch (error) {
    console.error("Dashboard fetch failed:", error);

    return NextResponse.json(
      {
        message: "Dashboard fetch failed",
      },
      {
        status: 500,
      },
    );
  }
}
