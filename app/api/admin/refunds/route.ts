import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refunds = await prisma.refundRequest.findMany({
    where: { tenantId: tenant.id },
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

  return NextResponse.json(refunds);
}
