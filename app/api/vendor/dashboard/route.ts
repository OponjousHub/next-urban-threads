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

    const lowStockProducts = await prisma.productVariant.findMany({
      where: {
        stock: {
          gt: 0,
          lte: 5,
        },
        product: {
          vendorId,
        },
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        stock: "asc",
      },
      take: 5,
    });

    return NextResponse.json({
      revenue: revenueResult._sum.totalAmount ?? 0,
      products,
      orders,
      pendingOrders,
      recentOrders,
      lowStockProducts,
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
