import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { code, subtotal } = await req.json();

    const { tenant } = await getAuthPayload();

    const coupon = await prisma.coupon.findFirst({
      where: {
        code: code.toUpperCase(),
        tenantId: tenant?.id,
      },
    });

    if (!coupon) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon not found",
        },
        { status: 404 },
      );
    }

    if (!coupon.active) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon is inactive",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    if (coupon.startsAt && coupon.startsAt > now) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon has not started yet",
        },
        { status: 400 },
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < now) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon has expired",
        },
        { status: 400 },
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        {
          valid: false,
          message: "Coupon usage limit reached",
        },
        { status: 400 },
      );
    }

    if (
      coupon.minimumAmount &&
      Number(subtotal) < Number(coupon.minimumAmount)
    ) {
      return NextResponse.json(
        {
          valid: false,
          message: `Minimum order amount is ${coupon.minimumAmount}`,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,

      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: Number(coupon.value),
      },
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        valid: false,
        message: "Failed to validate coupon",
      },
      { status: 500 },
    );
  }
}
