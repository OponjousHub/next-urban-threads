import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  try {
    /* -------------------- Revenue -------------------- */

    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PAID", "SHIPPED", "DELIVERED"],
        },
        tenantId: tenant.id,
      },
      select: {
        userId: true,
        totalAmount: true,
        createdAt: true,
      },
    });

    const revenue = orders.reduce(
      (sum, o) => sum + o.totalAmount.toNumber(),
      0,
    );

    /* -------------------- Orders count -------------------- */

    const totalOrders = await prisma.order.count({
      where: {
        tenantId: tenant.id,
        status: {
          in: ["PAID", "SHIPPED", "DELIVERED"],
        },
      },
    });
    /* -------------------- Customers -------------------- */

    const totalCustomers = await prisma.user.count({
      where: { role: "USER", tenantId: tenant.id },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    /*--------------------- Coversion Rate -------------------*/

    const uniqueBuyers = new Set(orders.map((o) => o.userId)).size;
    const conversionRate =
      totalCustomers > 0 ? (uniqueBuyers / totalCustomers) * 100 : 0;

    /*--------------------- Today New Customers -------------------*/

    const newCustomersToday = await prisma.user.count({
      where: {
        role: "USER",
        tenantId: tenant.id,
        createdAt: { gte: today },
      },
    });

    /* -------------------- Low stock -------------------- */

    const lowStock = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
        tenantId: tenant.id,
      },
      select: {
        id: true,
        name: true,
        stock: true,
      },
      take: 5,
    });

    /* -------------------- Recent orders -------------------- */

    const recentOrders = await prisma.order.findMany({
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
        createdAt: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    /*--------------------- Transform RecentOrder to desired structure------------- */

    const formattedRecentOrders = recentOrders.map((order) => ({
      id: order.id,
      customer: order.user?.name || "Guest Customer",
      email: order.user?.email || "No email",
      amount: Number(order.totalAmount),
      status:
        order.status === "PAID"
          ? "Paid"
          : order.status === "PENDING"
            ? "Pending"
            : order.status === "CANCELLED"
              ? "Cancelled"
              : "Paid",
      date: order.createdAt,
    }));

    /* -------------------- Top products -------------------- */

    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      where: {
        order: {
          tenantId: tenant.id,
          status: {
            in: ["PAID", "SHIPPED", "DELIVERED"],
          },
        },
      },
      _sum: {
        quantity: true,
        price: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 4,
    });

    // Fetch Products for the IDs

    const productIds = topProductsRaw.map((p) => p.productId);

    const productDetails = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
    });

    // Merge the result

    const topProducts = topProductsRaw.map((item) => {
      const product = productDetails.find((p) => p.id === item.productId);

      return {
        id: item.productId,
        name: product?.name ?? "Unknown product",
        image: product?.images ?? "/placeholder.png",
        sales: item._sum.quantity ?? 0,
        revenue: item._sum.price?.toNumber?.() ?? 0,
      };
    });

    /*--------------------- Returning Customers ------------- */
    const orderCounts: Record<string, number> = {};

    orders.forEach((o) => {
      orderCounts[o.userId] = (orderCounts[o.userId] || 0) + 1;
    });

    const returningCustomers = Object.values(orderCounts).filter(
      (count) => count > 1,
    ).length;

    const returningCustomerRate =
      totalCustomers > 0 ? (returningCustomers / totalCustomers) * 100 : 0;

    /* -------------------- Order status -------------------- */
    // Querying the database grouped by status

    const statusStats = await prisma.order.groupBy({
      by: ["status"],
      where: {
        tenantId: tenant.id,
      },
      _count: {
        id: true,
      },
      _sum: { totalAmount: true },
    });

    // Converting statusStats to desired structure

    const orderStatus = {
      paid: { count: 0, revenue: 0 },
      pending: { count: 0, revenue: 0 },
      cancelled: { count: 0, revenue: 0 },
      delivered: { count: 0, revenue: 0 },
    };

    statusStats.forEach((row) => {
      const revenue = row._sum.totalAmount?.toNumber?.() ?? 0;
      const count = row._count.id ?? 0;

      if (row.status === "PAID") {
        orderStatus.paid = { count, revenue };
      }

      if (row.status === "PENDING") {
        orderStatus.pending = { count, revenue };
      }

      if (row.status === "CANCELLED") {
        orderStatus.cancelled = { count, revenue };
      }

      if (row.status === "DELIVERED") {
        orderStatus.delivered = { count, revenue };
      }
    });

    return NextResponse.json({
      revenue,
      totalOrders,
      totalCustomers,
      newCustomersToday,
      lowStock,
      formattedRecentOrders,
      conversionRate,
      returningCustomerRate,
      orderStatus,
      topProducts,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Dashboard fetch failed" },
      { status: 500 },
    );
  }
}
