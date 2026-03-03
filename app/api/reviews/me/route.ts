import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    console.log("-------------ORDERID-----------", orderId);
    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID required" },
        { status: 400 },
      );
    }

    const { userId, tenant } = await getAuthPayload();

    if (!userId || !tenant?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1️⃣ Validate order belongs to user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId,
        tenantId: tenant.id,
      },
      include: {
        items: {
          select: {
            productId: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }

    // 2️⃣ Extract productIds
    const productIds = order.items.map((item) => item.productId);

    // 3️⃣ Fetch user reviews for those products
    const reviews = await prisma.review.findMany({
      where: {
        userId,
        tenantId: tenant.id,
        productId: {
          in: productIds,
        },
      },
    });

    return NextResponse.json(reviews);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}
