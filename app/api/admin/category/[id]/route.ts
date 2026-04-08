import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.category.delete({
    where: { id: params.id, tenantId: tenant.id },
  });

  return Response.json({ success: true });
}
