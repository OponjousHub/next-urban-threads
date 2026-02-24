import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLoggedInUserId, getCurrentSessionId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export async function POST() {
  const userId = await getLoggedInUserId();
  const tenant = await getDefaultTenant();
  const currentSessionId = await getCurrentSessionId();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }
  if (!userId || !tenant || !currentSessionId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await prisma.session.deleteMany({
    where: {
      userId,
      tenantId: tenant.id,
      NOT: {
        id: currentSessionId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
