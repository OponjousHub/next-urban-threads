import speakeasy from "speakeasy";
import QRCode from "qrcode";
import { prisma } from "@/utils/prisma";
import CryptoJS from "crypto-js";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function GET() {
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
      twoFactorTempSecretExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
    },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId, tenantId: tenant.id },
  });
  let qrCode;
  if (
    user?.twoFactorTempSecret &&
    user.twoFactorTempSecretExpiresAt &&
    user.twoFactorTempSecretExpiresAt > new Date()
  ) {
    qrCode = await QRCode.toDataURL(secret.otpauth_url!);
  } else {
    const secret2 = speakeasy.generateSecret({
      length: 20,
      name: "UrbanThreads",
    });

    qrCode = await QRCode.toDataURL(secret2.otpauth_url!);
  }
  console.log("SETUP SECRET:", secret.base32);

  return NextResponse.json({ qrCode }, { status: 200 });
}
