import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const { orderId, email } = await req.json();

    if (!orderId || !email) {
      return NextResponse.json(
        { error: "Order ID and email are required" },
        { status: 400 },
      );
    }

    const order = await prisma.order.findFirst({
      where: {
        id: orderId.trim(),
        tenantId: tenant.id,
        customerEmail: email.toLowerCase().trim(),
      },
      include: {
        orderTrackingEvent: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}
