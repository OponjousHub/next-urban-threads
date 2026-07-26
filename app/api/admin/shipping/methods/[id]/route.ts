import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * UPDATE SHIPPING METHOD
 */
export async function PATCH(req: Request, { params }: RouteContext) {
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

    // Prevent duplicate names inside the same zone
    const existing = await prisma.shippingMethod.findFirst({
      where: {
        tenantId: tenant.id,
        zoneId,
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
          message:
            "Another shipping method with this name already exists in this zone.",
        },
        {
          status: 409,
        },
      );
    }

    const method = await prisma.shippingMethod.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        zoneId,
        name: name.trim(),
        description: description?.trim() || null,
        estimatedMinDays,
        estimatedMaxDays,
        active,
      },
    });

    return NextResponse.json(method);
  } catch (error) {
    console.error("[UPDATE_SHIPPING_METHOD]", error);

    return NextResponse.json(
      {
        message: "Failed to update shipping method.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE SHIPPING METHOD
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

    // Prevent deleting methods that still have rates
    const method = await prisma.shippingMethod.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
      include: {
        rates: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!method) {
      return NextResponse.json(
        {
          message: "Shipping method not found.",
        },
        {
          status: 404,
        },
      );
    }

    if (method.rates.length > 0) {
      return NextResponse.json(
        {
          message:
            "Delete all shipping rates before deleting this shipping method.",
        },
        {
          status: 400,
        },
      );
    }

    await prisma.shippingMethod.delete({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[DELETE_SHIPPING_METHOD]", error);

    return NextResponse.json(
      {
        message: "Failed to delete shipping method.",
      },
      {
        status: 500,
      },
    );
  }
}
