import { NextRequest, NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 },
      );
    }

    /* --------------------------------------------------
        Fetch order from DB
    -------------------------------------------------- */
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
        tenantId: tenant.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    /* --------------------------------------------------
        Validate order ownership
    -------------------------------------------------- */
    if (!order || order.userId !== userId) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    /* --------------------------------------------------
        Return order
    -------------------------------------------------- */
    return NextResponse.json(order, { status: 200 });
  } catch (error) {
    console.error("GET /api/orders/me/[orderId] error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
