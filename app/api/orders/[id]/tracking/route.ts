import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET(
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
    const events = await prisma.orderTrackingEvent.findMany({
      where: { orderId: params.id, tenantId: tenant.id },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(events);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch tracking" },
      { status: 500 },
    );
  }
}
