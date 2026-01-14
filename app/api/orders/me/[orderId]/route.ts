import { NextRequest, NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { cookies } from "next/headers";
import { prisma } from "@/utils/prisma";

type RouteParams = {
  params: {
    orderId: string;
  };
};

export async function GET(req: NextRequest, { params }: RouteParams) {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: missing token!" },
      { status: 401 }
    );
  }

  const userId = AuthController.getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }
  try {
    const { orderId } = params;

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID is required" },
        { status: 400 }
      );
    }

    /* --------------------------------------------------
        Fetch order from DB
    -------------------------------------------------- */
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    console.log(order);
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
      { status: 500 }
    );
  }
}
