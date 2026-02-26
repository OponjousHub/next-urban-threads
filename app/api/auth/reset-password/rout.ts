import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import bcrypt from "bcryptjs";
import { getAuthPayload } from "@/lib/server/auth";

import crypto from "crypto";

export async function POST(req: Request) {
  const auth = await getAuthPayload();
  const { tenant } = auth;

  if (!tenant) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const { token, newPassword } = await req.json();

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: hashedToken,
      resetTokenExpiry: { gt: new Date() },
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id, tenantId: tenant.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    },
  });

  // 🔐 Invalidate sessions
  await prisma.session.deleteMany({
    where: { userId: user.id, tenantId: tenant.id },
  });

  return NextResponse.json({ message: "Password reset successful" });
}
