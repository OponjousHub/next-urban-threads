import speakeasy from "speakeasy";
import QRCode from "qrcode";
import CryptoJS from "crypto-js";
import { prisma } from "@/utils/prisma";

export async function setup2FA(userId: string) {
  const secret = speakeasy.generateSecret({
    length: 20,
    name: "UrbanThreads",
  });

  const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

  return {
    secret: secret.base32,
    qrCode,
  };
}
