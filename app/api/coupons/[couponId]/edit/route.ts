import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/server/auth";

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      couponId: string;
    }>;
  },
) {
  try {
    const { couponId } = await params;
    const { tenant } = await getAuthPayload();

    if (!tenant?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    const code = String(data.code || "")
      .trim()
      .toUpperCase();

    if (!code) {
      return NextResponse.json(
        { message: "Coupon code is required" },
        { status: 400 },
      );
    }

    const value = Number(data.value);

    if (!Number.isFinite(value) || value <= 0) {
      return NextResponse.json(
        { message: "Discount value must be greater than zero" },
        { status: 400 },
      );
    }

    if (data.type === "PERCENTAGE" && value > 100) {
      return NextResponse.json(
        { message: "Percentage discount cannot exceed 100%" },
        { status: 400 },
      );
    }

    const existingCoupon = await prisma.coupon.findFirst({
      where: {
        id: couponId,
        tenantId: tenant.id,
      },
    });

    if (!existingCoupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 },
      );
    }

    const duplicate = await prisma.coupon.findFirst({
      where: {
        tenantId: tenant.id,
        code,
        NOT: {
          id: couponId,
        },
      },
    });

    if (duplicate) {
      return NextResponse.json(
        { message: `Coupon "${code}" already exists` },
        { status: 400 },
      );
    }

    const minimumAmount =
      data.minimumOrderAmount !== undefined && data.minimumOrderAmount !== ""
        ? Number(data.minimumOrderAmount)
        : null;

    const usageLimit =
      data.usageLimit !== undefined && data.usageLimit !== ""
        ? Number(data.usageLimit)
        : null;

    if (minimumAmount !== null && minimumAmount < 0) {
      return NextResponse.json(
        { message: "Minimum order amount cannot be negative" },
        { status: 400 },
      );
    }

    if (
      usageLimit !== null &&
      (!Number.isInteger(usageLimit) || usageLimit <= 0)
    ) {
      return NextResponse.json(
        { message: "Usage limit must be a positive whole number" },
        { status: 400 },
      );
    }

    const coupon = await prisma.coupon.update({
      where: {
        id: couponId,
      },
      data: {
        code,
        description: data.description?.trim() || null,
        type: data.type,
        value,
        minimumAmount,
        usageLimit,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        active: data.active ?? true,
      },
    });

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("[UPDATE_COUPON_ERROR]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not update coupon",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: Promise<{
      couponId: string;
    }>;
  },
) {
  try {
    const { couponId } = await params;
    const { tenant } = await getAuthPayload();

    if (!tenant?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const coupon = await prisma.coupon.findFirst({
      where: {
        id: couponId,
        tenantId: tenant.id,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        { message: "Coupon not found" },
        { status: 404 },
      );
    }

    await prisma.coupon.delete({
      where: {
        id: couponId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("[DELETE_COUPON_ERROR]", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Could not delete coupon",
      },
      { status: 500 },
    );
  }
}
