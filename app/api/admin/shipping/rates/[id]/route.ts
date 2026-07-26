import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/**
 * UPDATE SHIPPING RATE
 */
export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Tenant not found.",
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
      methodId,
      name,
      description,
      amount,
      minOrderAmount,
      maxOrderAmount,
      minWeight,
      maxWeight,
      priority,
      active,
      isDefault,
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

    if (!methodId) {
      return NextResponse.json(
        {
          message: "Shipping method is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        {
          message: "Rate name is required.",
        },
        {
          status: 400,
        },
      );
    }

    if (amount === undefined || amount === null || Number(amount) < 0) {
      return NextResponse.json(
        {
          message: "Shipping amount is invalid.",
        },
        {
          status: 400,
        },
      );
    }

    const method = await prisma.shippingMethod.findFirst({
      where: {
        id: methodId,
        tenantId: tenant.id,
        zoneId,
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

    // Duplicate name check
    const existing = await prisma.shippingRate.findFirst({
      where: {
        tenantId: tenant.id,
        methodId,
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
            "Another shipping rate with this name already exists for this shipping method.",
        },
        {
          status: 409,
        },
      );
    }

    if (
      minOrderAmount !== null &&
      maxOrderAmount !== null &&
      minOrderAmount > maxOrderAmount
    ) {
      return NextResponse.json(
        {
          message: "Minimum order amount cannot exceed maximum order amount.",
        },
        {
          status: 400,
        },
      );
    }

    if (minWeight !== null && maxWeight !== null && minWeight > maxWeight) {
      return NextResponse.json(
        {
          message: "Minimum weight cannot exceed maximum weight.",
        },
        {
          status: 400,
        },
      );
    }

    // Ensure only one default rate per shipping method
    if (isDefault) {
      await prisma.shippingRate.updateMany({
        where: {
          tenantId: tenant.id,
          methodId,
          id: {
            not: id,
          },
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const rate = await prisma.shippingRate.update({
      where: {
        id,
        tenantId: tenant.id,
      },
      data: {
        zoneId,
        methodId,
        name: name.trim(),
        description: description?.trim() || null,
        amount,
        minOrderAmount,
        maxOrderAmount,
        minWeight,
        maxWeight,
        priority: priority ?? 1,
        active: active ?? true,
        isDefault: isDefault ?? false,
      },
    });

    return NextResponse.json(rate);
  } catch (error) {
    console.error("[UPDATE_SHIPPING_RATE]", error);

    return NextResponse.json(
      {
        message: "Failed to update shipping rate.",
      },
      {
        status: 500,
      },
    );
  }
}

/**
 * DELETE SHIPPING RATE
 */
export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Tenant not found.",
        },
        {
          status: 404,
        },
      );
    }

    const { id } = await params;

    const rate = await prisma.shippingRate.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!rate) {
      return NextResponse.json(
        {
          message: "Shipping rate not found.",
        },
        {
          status: 404,
        },
      );
    }

    await prisma.shippingRate.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[DELETE_SHIPPING_RATE]", error);

    return NextResponse.json(
      {
        message: "Failed to delete shipping rate.",
      },
      {
        status: 500,
      },
    );
  }
}
