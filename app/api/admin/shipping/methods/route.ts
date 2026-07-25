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

    const {
      zoneId,
      name,
      description,
      estimatedMinDays,
      estimatedMaxDays,
      active,
    } = body;

    if (!zoneId) {
      return NextResponse.json(
        {
          message: "Shipping zone is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        {
          message: "Method name is required.",
        },
        {
          status: 400,
        },
      );
    }

    // Verify zone belongs to this tenant
    const zone = await prisma.shippingZone.findFirst({
      where: {
        id: zoneId,
        tenantId: tenant.id,
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

    // Prevent duplicate names within the same zone
    const existing = await prisma.shippingMethod.findFirst({
      where: {
        tenantId: tenant.id,
        zoneId,
        name: {
          equals: name.trim(),
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message:
            "A shipping method with this name already exists in this zone.",
        },
        {
          status: 409,
        },
      );
    }

    const method = await prisma.shippingMethod.create({
      data: {
        tenantId: tenant.id,
        zoneId,
        name: name.trim(),
        description: description?.trim() || null,
        estimatedMinDays,
        estimatedMaxDays,
        active: active ?? true,
      },
    });

    return NextResponse.json(method, {
      status: 201,
    });
  } catch (error) {
    console.error("[CREATE_SHIPPING_METHOD]", error);

    return NextResponse.json(
      {
        message: "Failed to create shipping method.",
      },
      {
        status: 500,
      },
    );
  }
}
