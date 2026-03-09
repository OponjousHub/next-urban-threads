import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET() {
  try {
    /* -------------------- Revenue -------------------- */

    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
      },
      select: {
        totalAmount: true,
        createdAt: true,
      },
    });

    const revenue = orders.reduce(
      (sum, o) => sum + o.totalAmount.toNumber(),
      0,
    );

    /* -------------------- Orders count -------------------- */

    const totalOrders = await prisma.order.count();

    /* -------------------- Customers -------------------- */

    const totalCustomers = await prisma.user.count({
      where: { role: "USER" },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const newCustomersToday = await prisma.user.count({
      where: {
        role: "USER",
        createdAt: { gte: today },
      },
    });

    /* -------------------- Low stock -------------------- */

    const lowStock = await prisma.product.findMany({
      where: {
        stock: { lt: 5 },
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
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: true,
      },
    });

    /* -------------------- Order status -------------------- */

    const paidOrders = await prisma.order.count({
      where: { status: "PAID" },
    });

    const pendingOrders = await prisma.order.count({
      where: { status: "PENDING" },
    });

    const cancelledOrders = await prisma.order.count({
      where: { status: "CANCELLED" },
    });

    return NextResponse.json({
      revenue,
      totalOrders,
      totalCustomers,
      newCustomersToday,
      lowStock,
      recentOrders,
      orderStatus: {
        paid: paidOrders,
        pending: pendingOrders,
        cancelled: cancelledOrders,
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
