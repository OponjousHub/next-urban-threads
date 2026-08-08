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
          tenantId: tenant.id,
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
          order: revenueOrderFilter,
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
     * Summary
     * ---------------------------------------------------------
     */
    const totalRevenue = revenueAggregate._sum.totalAmount?.toNumber?.() ?? 0;

    const totalOrders = revenueAggregate._count.id ?? 0;

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
      const category = item.product.category.name || "Other";
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
    return NextResponse.json({
      storeMode: tenant.storeMode,
      currency: tenant.currency,
      timezone: tenant.timezone,

      summary: {
        totalRevenue,
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
