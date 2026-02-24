import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";
import speakeasy from "speakeasy";
import CryptoJS from "crypto-js";
import { hashCode } from "@/app/lib/recoveryCode";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  try {
    const body = await req.json();
    const { userId, token, tenantId, mode } = body;

    if (!userId || !token || !tenantId) {
      return NextResponse.json(
        { message: "Missing verification data" },
        { status: 400 },
      );
    }

    // Generating session
    const headersList = await headers();
    const userAgent = headersList.get("user-agent") || "";
    const ip =
      headersList.get("x-forwarded-for") ||
      headersList.get("x-real-ip") ||
      "unknown";

    // Convert IPv6 localhost
    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown Browser";
    const os = parser.getOS().name || "Unknown OS";
    const deviceLabel = `${browser} on ${os}`;

    // ⭐ Fetch user
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        tenantId,
      },
      select: {
        id: true,
        email: true,
        twoFactorEnabled: true,
        twoFactorSecret: true,
        status: true,
        recoveryCodes: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ message: "2FA not enabled" }, { status: 400 });
    }

    // ⭐ Verify OTP
    if (mode === "otp") {
      const bytes = CryptoJS.AES.decrypt(
        user.twoFactorSecret,
        process.env.TWO_FACTOR_SECRET!,
      );

      const decryptedSecret = bytes.toString(CryptoJS.enc.Utf8);

      const isValid = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: "base32",
        token: token.trim(),
        window: 2,
      });

      if (!isValid) {
        return NextResponse.json(
          { message: "Invalid verification code" },
          { status: 401 },
        );
      }
    }

    // Verify Recovery code
    // ⭐ Verify Recovery code
    let usedRecoveryLogin = false;
    let remainingCodes;

    if (mode === "recovery") {
      const normalizedToken = token.trim().toUpperCase();
      const hashedToken = hashCode(normalizedToken);

      const storedCodes = user.recoveryCodes || [];

      const codeIndex = storedCodes.indexOf(hashedToken);

      if (codeIndex === -1) {
        return NextResponse.json(
          { message: "Invalid or already used recovery code" },
          { status: 401 },
        );
      }

      // ✅ Remove used code (one-time use)
      storedCodes.splice(codeIndex, 1);

      // GET the number of Recovery codes remaining
      remainingCodes = storedCodes.length;

      await prisma.user.update({
        where: { id: user.id, tenantId },
        data: {
          recoveryCodes: storedCodes,
        },
      });

      usedRecoveryLogin = true;

      cookieStore.set(
        "recovery_notice",
        JSON.stringify({ remaining: remainingCodes }),
        {
          httpOnly: true,
          maxAge: 60 * 2, // 10 minutes
          sameSite: "lax",
          path: "/",
        },
      );
    }

    // ⭐ Create JWT session
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    const session = await prisma.session.create({
      data: {
        userId: user.id,
        tenantId,
        userAgent,
        ipAddress: normalizedIp,
        deviceName: deviceLabel,
      },
    });

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        tenantId,
        sessionId: session.id,
        usedRecoveryLogin,
      },
      jwtSecret,
      { expiresIn: "7d" },
    );

    // ⭐ Set cookie
    cookieStore.set("token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      success: true,
      remainingRecoveryCodes: remainingCodes,
    });
  } catch (error) {
    console.error("VERIFY 2FA ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
