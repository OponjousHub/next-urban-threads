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
      include: {
        user: true,
      },
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

    const paidOrders = await prisma.order.count({
      where: { status: "PAID", tenantId: tenant.id },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING", tenantId: tenant.id },
    });

    const cancelledOrders = await prisma.order.count({
      where: { status: "CANCELLED", tenantId: tenant.id },
    });
    const deliveredOrders = await prisma.order.count({
      where: { status: "DELIVERED", tenantId: tenant.id },
    });
    console.log("LOW STOCK", lowStock);
    return NextResponse.json({
      revenue,
      totalOrders,
      totalCustomers,
      newCustomersToday,
      lowStock,
      recentOrders,
      conversionRate,
      returningCustomerRate,
      orderStatus: {
        paid: paidOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
        delivered: deliveredOrders,
      },
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Dashboard fetch failed" },
      { status: 500 },
    );
  }
}
