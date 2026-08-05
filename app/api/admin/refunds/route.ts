import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refunds = await prisma.refundRequest.findMany({
    where: { tenantId: tenant.id, storeMode: tenant.storeMode },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderId: true,
      status: true,
      requestedAmount: true,
      createdAt: true,
      reason: true,
    },
  });

  const [
    totalRefunds,
    requestedRefunds,
    approvedRefunds,
    processingRefunds,
    refundedRefunds,
    failedRefunds,
  ] = await Promise.all([
    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
      },
    }),

    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
        status: "REQUESTED",
      },
    }),

    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
        status: "APPROVED",
      },
    }),

    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
        status: "PROCESSING",
      },
    }),

    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
        status: "REFUNDED",
      },
    }),

    prisma.refundRequest.count({
      where: {
        tenantId: tenant.id,
        status: "FAILED",
      },
    }),
  ]);

  return NextResponse.json({
    refunds,
    totalRefunds,
    requestedRefunds,
    approvedRefunds,
    processingRefunds,
    refundedRefunds,
    failedRefunds,
  });
}
