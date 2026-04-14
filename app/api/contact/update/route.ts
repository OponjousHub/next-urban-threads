import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { id, status } = await req.json();

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let updateData: any = {};

  if (status === "HIGH_PRIORITY") {
    updateData.priority = "HIGH";
  } else {
    updateData.status = status;
  }

  await prisma.contact.update({
    where: { id, tenantId: tenant.id },
    data: updateData,
  });

  return Response.json({ success: true });
}
