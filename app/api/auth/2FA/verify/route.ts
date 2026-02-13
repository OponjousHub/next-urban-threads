import { prisma } from "@/utils/prisma";
import speakeasy from "speakeasy";

export async function verify2FA({
  userId,
  token,
  secret,
}: {
  userId: string;
  token: string;
  secret: string;
}) {
  const verified = speakeasy.totp({
    secret,
    encoding: "base32",
    token,
  });

  if (!verified) throw new Error("Invalid code");

  const encrypted = CryptoJS.AES.encrypt(
    secret,
    process.env.TWO_FACTOR_SECRET!,
  ).toString();

  await prisma.user.update({
    where: { id: userId },
    data: {
      twoFactorEnabled: true,
      twoFactorSecret: encrypted,
    },
  });

  return true;
}
