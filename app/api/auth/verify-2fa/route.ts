import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/utils/prisma";
import speakeasy from "speakeasy";
import CryptoJS from "crypto-js";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  try {
    const body = await req.json();
    const { userId, token, tenantId } = body;

    if (!userId || !token || !tenantId) {
      return NextResponse.json(
        { message: "Missing verification data" },
        { status: 400 },
      );
    }

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
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      return NextResponse.json({ message: "2FA not enabled" }, { status: 400 });
    }

    // ⭐ Verify OTP
    // const isValid = authenticator.verify({
    const bytes = CryptoJS.AES.decrypt(
      user.twoFactorSecret,
      process.env.TWO_FACTOR_SECRET!,
    );

    const decryptedSecret = bytes.toString(CryptoJS.enc.Utf8);

    console.log("DECRYPTED SECRET:", decryptedSecret);

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

    // ⭐ Create JWT session
    const jwtSecret = process.env.JWT_SECRET;

    if (!jwtSecret) {
      throw new Error("JWT_SECRET not configured");
    }

    const sessionToken = jwt.sign(
      {
        userId: user.id,
        tenantId,
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
    });
  } catch (error) {
    console.error("VERIFY 2FA ERROR:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
