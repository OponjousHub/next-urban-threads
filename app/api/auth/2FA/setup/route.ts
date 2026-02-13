import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/utils/prisma";
import CryptoJS from "crypto-js";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function setup2FA() {
  const tenant = await getDefaultTenant();
  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const secret = speakeasy.generateSecret({
    length: 20,
    name: "UrbanThreads",
  });

  // Encrypt before saving (optional but recommended)
  const encryptedTempSecret = CryptoJS.AES.encrypt(
    secret.base32,
    process.env.TWO_FACTOR_SECRET!,
  ).toString();

  await prisma.user.update({
    where: { id: userId, tenantId: tenant.id },
    data: {
      twoFactorTempSecret: encryptedTempSecret,
    },
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    qrCode,
  };
}
