import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const body = await req.json();

  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
  }

  await prisma.tenant.update({
    where: {
      id: tenant.id,
    },

    data: {
      storeMode: body.storeMode,
    },
  });

  return NextResponse.json({
    success: true,
  });
}
