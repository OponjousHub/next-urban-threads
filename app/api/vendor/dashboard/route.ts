import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function GET() {
  try {
    const { vendorId } = await getCurrentVendor();

    const [products, orders, pendingOrders, recentOrders] = await Promise.all([
      prisma.product.count({
        where: {
          vendorId,
        },
      }),

      prisma.order.count({
        where: {
          vendorId,
        },
      }),

      prisma.order.count({
        where: {
          vendorId,
          status: "PENDING",
        },
      }),

      prisma.order.findMany({
        where: {
          vendorId,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    const revenueResult = await prisma.order.aggregate({
      where: {
        vendorId,
        paymentStatus: "PAID",
      },
      _sum: {
        totalAmount: true,
      },
    });

    return NextResponse.json({
      revenue: revenueResult._sum.totalAmount ?? 0,

      products,
      orders,
      pendingOrders,
      recentOrders,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to load dashboard",
      },
      {
        status: 500,
      },
    );
  }
}
