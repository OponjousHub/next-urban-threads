import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refunds = await prisma.refundRequest.findMany({
    where: { userId, tenantId: tenant.id },
    include: {
      items: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(refunds);
}
