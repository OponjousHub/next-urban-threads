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

    const {
      status, // should match OrderStatus enum
      title,
      description, // ✅ renamed from message
      location,
      type, // optional (enum)
    } = body;

    // ✅ Create tracking event
    const event = await prisma.orderTrackingEvent.create({
      data: {
        orderId: params.id,
        tenantId: tenant.id,

        type: type || "STATUS_CHANGE", // ✅ enum default
        status: status || undefined, // ✅ optional enum

        title,
        description,
        location,
      },
    });

    // ✅ Only update order if this is a status change
    if (status) {
      await prisma.order.update({
        where: { id: params.id },
        data: { status },
      });
    }

    return NextResponse.json(event);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Failed to create tracking event" },
      { status: 500 },
    );
  }
}
