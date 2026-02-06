import crypto from "crypto";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import changeEmailVerification from "../../../lib/email/template/changeEmailVerification";
import { sendEmail } from "../../../lib/email/sendEmail";

export async function PATCH(req: Request) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { newEmail, password } = await req.json();
  console.log(newEmail);
  // CHECK IF EMAILL ADDRESS IS VALID

  // CHECK IF EMAIL ALREADY EXIST
  const existing = await prisma.user.findUnique({
    where: { email: newEmail },
  });

  // VERIFY PASSWORD

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

  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;
  console.log(token);
  console.log(verifyUrl);

  const template = changeEmailVerification(verifyUrl);
  console.log(template);

  // TODO: send email with verification link
  // await sendEmailVerification({
  //   to: newEmail,
  //   token,
  // });
  await sendEmail({
    to: newEmail,
    subject: template.subject,
    html: template.html,
  });

  return Response.json({
    message: "Verification email sent",
  });
}
