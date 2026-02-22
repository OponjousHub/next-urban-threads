import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

import { prisma } from "@/utils/prisma";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();
  const userId = await getLoggedInUserId();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }

  await prisma.session.delete({
    where: { userId, tenantId: tenant.id, id: params.id },
  });

  return Response.json({ success: true });
}
