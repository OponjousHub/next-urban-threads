import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export async function POST() {
  const userId = await getLoggedInUserId();
  const tenant = await getDefaultTenant();
  const cookieStore = await cookies();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }

  if (!userId || !tenant) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  await prisma.session.deleteMany({
    where: {
      userId,
      tenantId: tenant.id,
    },
  });

  // Clear cookies
  cookieStore.delete("token");
  cookieStore.delete("session_id");

  return NextResponse.json({ success: true });
}
