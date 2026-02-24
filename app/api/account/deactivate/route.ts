import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { cookies } from "next/headers";

export async function POST() {
  const auth = await getAuthPayload();
  //   if (!auth) {
  //     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  //   }

  const { userId, tenant, currentSessionId } = auth;
  if (!userId || !currentSessionId || !tenant?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  // 1️⃣ Deactivate user
  await prisma.user.update({
    where: { id: userId, tenantId: tenant.id },
    data: {
      isActive: false,
      deactivatedAt: new Date(),
    },
  });

  // 2️⃣ Delete ALL sessions
  await prisma.session.deleteMany({
    where: {
      userId,
      tenantId: tenant.id,
    },
  });

  // 3️⃣ Clear auth cookie
  const cookieStore = await cookies();
  cookieStore.delete("token");

  return NextResponse.json({ success: true });
}
