import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, status } = await req.json();

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.contact.update({
    where: { id, tenantId: tenant.id },
    data: { status },
  });

  return Response.json({ success: true });
}
