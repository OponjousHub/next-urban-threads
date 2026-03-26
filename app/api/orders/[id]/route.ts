import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

// Import your enums/types to match Prisma
type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";
type PaymentStatus = "PENDING" | "PAID" | "FAILED";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    return NextResponse.json(
      { error: "Default tenant not found" },
      { status: 404 },
    );
  }

  try {
    const {
      status,
      paymentStatus,
    }: { status?: OrderStatus; paymentStatus?: PaymentStatus } =
      await req.json();

    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: "No status or paymentStatus provided" },
        { status: 400 },
      );
    }

    // Build update object dynamically
    const updateData: Partial<{
      status: OrderStatus;
      paymentStatus: PaymentStatus;
    }> = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    const order = await prisma.order.update({
      where: { id: params.id, tenantId: tenant.id },
      data: updateData,
    });

    return NextResponse.json(order);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 },
    );
  }
}
