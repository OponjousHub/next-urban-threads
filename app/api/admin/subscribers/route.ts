import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const subscribers = await prisma.newsletter.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(subscribers);
}
