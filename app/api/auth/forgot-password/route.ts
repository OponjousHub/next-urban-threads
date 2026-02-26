import { getAuthPayload } from "@/lib/server/auth";
import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/app/lib/email/sendEmail";

import crypto from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  const auth = await getAuthPayload();
  const { tenant } = auth;

  if (!tenant) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email, tenantId: tenant.id },
  });

  if (!user) {
    // Always return success to prevent enumeration
    return NextResponse.json({ message: "If email exists, reset link sent" });
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id, tenantId: tenant.id },
    data: {
      resetToken: hashedToken,
      resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60), // 1 hour
    },
  });

  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${rawToken}&tenant=${tenant.id}`;

  await sendEmail({
    to: user.email,
    subject: "Reset Your Password",
    html: `Click <a href="${resetUrl}">here</a> to reset your password.`,
  });

  return NextResponse.json({ message: "If email exists, reset link sent" });
}
