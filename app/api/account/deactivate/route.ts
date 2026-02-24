import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  const { password } = await req.json();

  const auth = await getAuthPayload();

  const { userId, tenant, currentSessionId } = auth;
  if (!userId || !currentSessionId || !tenant?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId, tenantId: tenant.id },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  const valid = await bcrypt.compare(password, user.password);

  if (!valid) {
    return NextResponse.json(
      { message: "Incorrect password" },
      { status: 401 },
    );
  }

  await prisma.user.update({
    where: { id: userId, tenantId: tenant.id },
    data: { isActive: false },
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
