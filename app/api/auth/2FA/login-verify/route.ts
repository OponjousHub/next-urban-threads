import speakeasy from "speakeasy";
import { prisma } from "@/utils/prisma";

export async function loginVerify2FA(userId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  const decrypted = CryptoJS.AES.decrypt(
    user!.twoFactorSecret!,
    process.env.TWO_FACTOR_SECRET!,
  ).toString(CryptoJS.enc.Utf8);

  const verified = speakeasy.totp({
    secret: decrypted,
    encoding: "base32",
    token,
  });

  if (!verified) throw new Error("Invalid code");

  return true;
}
