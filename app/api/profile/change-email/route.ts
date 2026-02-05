import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function PATCH(req: Request) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newEmail } = await req.json();

  // CHECK IF EMAIL ALREADY EXIST
  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  if (existing) {
    return Response.json(
      { error: "Duplicate email not allowed!" },
      { status: 400 },
    );
  }

  const token = crypto.randomBytes(32).toString("hex");

  await prisma.user.update({
    where: { id: userId },
    data: {
      pendingEmail: newEmail,
      emailVerifyToken: token,
      emailTokenExpiry: new Date(Date.now() + 1000 * 60 * 30), // 30 mins
    },
  });

  // TODO: send email with verification link

  return Response.json({
    message: "Verification email sent",
  });
}
