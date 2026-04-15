import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";
import { ContactStatus } from "@prisma/client";

export async function POST(req: Request) {
  const { id, status } = await req.json();

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const contact = await prisma.contact.findFirst({
    where: { id, tenantId: tenant.id },
  });

  if (!contact) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let updateData: any = {};

  if (status === "HIGH_PRIORITY") {
    updateData.priority = "HIGH";
  } else {
    updateData.status = status as ContactStatus;
  }

  const updated = await prisma.contact.update({
    where: { id },
    data: updateData,
  });

  return NextResponse.json({
    success: true,
    updated,
  });
}
