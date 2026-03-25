import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
      },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        items: {
          select: { id: true },
        },
      },
    });

    const formatted = orders.map((order) => ({
      id: order.id,
      createdAt: order.createdAt,
      total: order.totalAmount,
      paymentStatus: order.paymentStatus,
      status: order.status,
      customer: order.user,
      itemsCount: order.items.length,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 },
    );
  }
}
