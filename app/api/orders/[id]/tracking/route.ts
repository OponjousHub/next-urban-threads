import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { TrackingEventType } from "@prisma/client";

// export async function GET(
//   req: Request,
//   { params }: { params: { id: string } },
// ) {
//   const param = await params;
//   const tenant = await getDefaultTenant();
//   if (!tenant) {
//     return NextResponse.json(
//       { error: "Default tenant not found" },
//       { status: 404 },
//     );
//   }

//   try {
//     const events = await prisma.orderTrackingEvent.findMany({
//       where: { orderId: param.id, tenantId: tenant.id },
//       orderBy: { createdAt: "asc" },
//     });

//     return NextResponse.json(events);
//   } catch (err) {
//     return NextResponse.json(
//       { error: "Failed to fetch tracking" },
//       { status: 500 },
//     );
//   }
// }

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================================
// GET TRACKING EVENTS
// ============================================================

export async function GET(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { error: "Default tenant not found" },
        { status: 404 },
      );
    }

    const events = await prisma.orderTrackingEvent.findMany({
      where: {
        orderId: id,
        tenantId: tenant.id,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("GET TRACKING EVENTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch tracking",
      },
      { status: 500 },
    );
  }
}

// ============================================================
// POST MANUAL TRACKING EVENT
// ============================================================
//
// IMPORTANT:
// This creates a tracking event only.
// It does NOT change Order.status.
//
// Normal order status changes are handled by:
// PATCH /api/orders/[id]
//
// ============================================================

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { error: "Default tenant not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const { title, description, location, type, status } = body;

    // ---------------------------------------------------------
    // Make sure the order belongs to the current tenant
    // ---------------------------------------------------------

    const order = await prisma.order.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
      select: {
        id: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // ---------------------------------------------------------
    // Create tracking event ONLY
    // ---------------------------------------------------------

    const event = await prisma.orderTrackingEvent.create({
      data: {
        orderId: order.id,
        tenantId: tenant.id,
        type: type || TrackingEventType.STATUS_CHANGE,
        status: status || undefined,
        title,
        description,
        location,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error("CREATE TRACKING EVENT ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to create tracking event",
      },
      { status: 500 },
    );
  }
}
