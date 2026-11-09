import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import changeEmailVerification from "../../../lib/email/template/changeEmailVerification";
import { sendEmail } from "../../../lib/email/sendEmail";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: Request) {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const newEmail =
      typeof body.newEmail === "string"
        ? body.newEmail.trim().toLowerCase()
        : "";
    const password = body.password;

    if (!newEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      return Response.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      );
    }

    if (typeof password !== "string" || !password) {
      return Response.json(
        { error: "Please enter your current password." },
        { status: 400 },
      );
    }

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return Response.json(
        { error: "Store configuration not found." },
        { status: 500 },
      );
    }

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        tenantId: tenant.id,
        isDeleted: false,
        status: "ACTIVE",
      },
    });

    if (!user) {
      return Response.json({ error: "User not found." }, { status: 404 });
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return Response.json(
        { error: "Incorrect password. Please try again." },
        { status: 401 },
      );
    }

    const existing = await prisma.user.findFirst({
      where: {
        email: newEmail,
        tenantId: tenant.id,
        isDeleted: false,
      },
    });

    if (existing) {
      return Response.json(
        { error: "This email address is already in use." },
        { status: 400 },
      );
    }

    if (newEmail === user.email.toLowerCase()) {
      return Response.json(
        { error: "This is already your current email address." },
        { status: 400 },
      );
    }

    const token = crypto.randomBytes(32).toString("hex");

    await prisma.user.update({
      where: { id: userId },
      data: {
        pendingEmail: newEmail,
        emailVerifyToken: token,
        emailTokenExpiry: new Date(Date.now() + 1000 * 60 * 30),
      },
    });

    try {
      const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

      const template = changeEmailVerification(verifyUrl, {
        name: tenant.name,
        logo: tenant.logo,
        primaryColor: tenant.primaryColor,
      });

      await sendEmail({
        to: newEmail,
        subject: template.subject,
        html: template.html,
        category: "security",
      });
    } catch (emailError) {
      // Clear only this request's pending verification.
      await prisma.user.updateMany({
        where: {
          id: userId,
          emailVerifyToken: token,
        },
        data: {
          pendingEmail: null,
          emailVerifyToken: null,
          emailTokenExpiry: null,
        },
      });

      console.error("Change email delivery failed:", emailError);

      return Response.json(
        {
          error:
            "We couldn't send a verification email to this address. Please check the address and try again.",
        },
        { status: 502 },
      );
    }

    return Response.json({
      message: "Verification email sent successfully.",
    });
  } catch (error) {
    console.error("Change email request failed:", error);

    return Response.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
