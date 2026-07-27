import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * UPDATE SHIPPING ZONE
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    const { id } = await params;

    const body = await req.json();

    const { name, description, country, states, active } = body;

    if (!name?.trim()) {
      return NextResponse.json(
        {
          message: "Zone name is required.",
        },
        {
          status: 400,
        },
      );
    }

    // Prevent duplicate names
    const existing = await prisma.shippingZone.findFirst({
      where: {
        tenantId: tenant.id,
        id: {
          not: id,
        },
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "Another shipping zone already uses this name.",
        },
        {
          status: 409,
        },
      );
    }

    const zone = await prisma.shippingZone.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        name: name.trim(),
        country,
        states,
        description: description?.trim() || null,
        active,
      },
    });

    return NextResponse.json(zone);
  } catch (error) {
    console.error("[UPDATE_SHIPPING_ZONE]", error);

    return NextResponse.json(
      {
        message: "Failed to update shipping zone.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE SHIPPING ZONE
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Tenant not found",
        },
        {
          status: 404,
        },
      );
    }

    const { id } = await params;

    // Don't allow deleting a zone that still has shipping methods
    const zone = await prisma.shippingZone.findUnique({
      where: {
        id,
      },
      include: {
        methods: true,
      },
    });

    if (!zone) {
      return NextResponse.json(
        {
          message: "Shipping zone not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (zone.methods.length > 0) {
      return NextResponse.json(
        {
          message: "Remove all shipping methods before deleting this zone.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.shippingZone.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[DELETE_SHIPPING_ZONE]", error);

    return NextResponse.json(
      {
        message: "Failed to delete shipping zone.",
      },
      {
        status: 500,
      },
    );
  }
}
