import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
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

    // Prevent duplicate zone names
    const existing = await prisma.shippingZone.findFirst({
      where: {
        tenantId: tenant.id,
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "A shipping zone with this name already exists.",
        },
        {
          status: 409,
        },
      );
    }

    const zone = await prisma.shippingZone.create({
      data: {
        tenantId: tenant.id,
        name: name.trim(),
        country,
        states,
        description: description?.trim() || null,
        active: active ?? true,
      },
    });

    return NextResponse.json(zone, {
      status: 201,
    });
  } catch (error) {
    console.error("[CREATE_SHIPPING_ZONE]", error);

    return NextResponse.json(
      {
        message: "Failed to create shipping zone.",
      },
      {
        status: 500,
      },
    );
  }
}
