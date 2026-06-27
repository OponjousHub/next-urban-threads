import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function POST(req: NextRequest) {
  try {
    const { tenant } = await getAuthPayload();
    const { vendor } = await getCurrentVendor();

    if (!tenant || !vendor) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json({ message: "Invalid amount" }, { status: 400 });
    }

    // ==========================
    // Calculate Available Balance
    // ==========================

    const orders = await prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        vendorId: vendor.id,
        paymentStatus: "PAID",
        status: "DELIVERED",
      },

      select: {
        totalAmount: true,
        commissionAmount: true,
      },
    });

    const gross = orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    );

    const commission = orders.reduce(
      (sum, order) => sum + Number(order.commissionAmount ?? 0),
      0,
    );

    const net = gross - commission;

    const paid = await prisma.vendorPayout.aggregate({
      where: {
        vendorId: vendor.id,
        tenantId: tenant.id,
        status: "PAID",
      },

      _sum: {
        amount: true,
      },
    });

    const pending = await prisma.vendorPayout.aggregate({
      where: {
        vendorId: vendor.id,
        tenantId: tenant.id,
        status: "PENDING",
      },

      _sum: {
        amount: true,
      },
    });

    const available =
      net - Number(paid._sum.amount ?? 0) - Number(pending._sum.amount ?? 0);

    if (Number(amount) > available) {
      return NextResponse.json(
        {
          message: "Requested amount exceeds available balance.",
        },
        { status: 400 },
      );
    }

    const payout = await prisma.vendorPayout.create({
      data: {
        vendorId: vendor.id,
        tenantId: tenant.id,

        amount: Number(amount),

        status: "PENDING",
      },
    });

    return NextResponse.json(payout);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        message: "Failed to create payout request",
      },
      {
        status: 500,
      },
    );
  }
}
