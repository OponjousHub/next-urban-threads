import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found." },
        { status: 404 },
      );
    }

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
        { message: "Shipping zone is required." },
        { status: 400 },
      );
    }

    if (!methodId) {
      return NextResponse.json(
        { message: "Shipping method is required." },
        { status: 400 },
      );
    }

    if (!name?.trim()) {
      return NextResponse.json(
        { message: "Rate name is required." },
        { status: 400 },
      );
    }

    if (amount === undefined || amount === null || Number(amount) < 0) {
      return NextResponse.json(
        { message: "Shipping amount is invalid." },
        { status: 400 },
      );
    }

    // Verify method belongs to tenant and selected zone
    const method = await prisma.shippingMethod.findFirst({
      where: {
        id: methodId,
        tenantId: tenant.id,
        zoneId,
      },
    });

    if (!method) {
      return NextResponse.json(
        { message: "Shipping method not found." },
        { status: 404 },
      );
    }

    // Prevent duplicate names within the same shipping method
    const existing = await prisma.shippingRate.findFirst({
      where: {
        tenantId: tenant.id,
        methodId,
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
            "A shipping rate with this name already exists for this shipping method.",
        },
        { status: 409 },
      );
    }

    // Validate order amount range
    if (
      minOrderAmount !== null &&
      maxOrderAmount !== null &&
      minOrderAmount > maxOrderAmount
    ) {
      return NextResponse.json(
        {
          message: "Minimum order amount cannot exceed maximum order amount.",
        },
        { status: 400 },
      );
    }

    // Validate weight range
    if (minWeight !== null && maxWeight !== null && minWeight > maxWeight) {
      return NextResponse.json(
        {
          message: "Minimum weight cannot exceed maximum weight.",
        },
        { status: 400 },
      );
    }

    // Only one default rate per shipping method
    if (isDefault) {
      await prisma.shippingRate.updateMany({
        where: {
          tenantId: tenant.id,
          methodId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const rate = await prisma.shippingRate.create({
      data: {
        tenantId: tenant.id,

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

    return NextResponse.json(rate, { status: 201 });
  } catch (error) {
    console.error("[CREATE_SHIPPING_RATE]", error);

    return NextResponse.json(
      {
        message: "Failed to create shipping rate.",
      },
      {
        status: 500,
      },
    );
  }
}
