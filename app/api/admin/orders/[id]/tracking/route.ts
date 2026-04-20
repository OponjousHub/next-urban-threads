import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(
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
    const body = await req.json();

    const { status, title, message, location } = body;

    const event = await prisma.orderTrackingEvent.create({
      where: { tenantId: tenant.id },
      data: {
        orderId: params.id,
        status,
        title,
        message,
        location,
      },
    });

    // OPTIONAL: also update order current status
    await prisma.order.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(event);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create tracking event" },
      { status: 500 },
    );
  }
}
