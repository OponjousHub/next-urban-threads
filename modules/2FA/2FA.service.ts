import { verify } from "crypto";
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import TwoFARepository from "./2FA.repository";
import CryptoJS from "crypto-js";
import speakeasy from "speakeasy";

class TwoFAService {
  static async verify(token: string) {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!tenant) {
      throw new Error("Default tenant not found");
    }
    console.log("VERIFY-SERVICE HIIIIIT ++++++++", token, userId, tenant.id);

    const user = await TwoFARepository.findUserFor2FA(userId, tenant.id);
    console.log("VERIFY-USER RETURN ++++++++", user);

    if (!user?.twoFactorTempSecret) {
      throw new Error("No 2FA setup in progress");
    }

    if (
      !user.twoFactorTempSecretExpiresAt ||
      user.twoFactorTempSecretExpiresAt < new Date()
    ) {
      console.log("2FA setup expired");
      throw new Error("2FA setup expired");
    }

    // Decrypt temporary secret
    const bytes = CryptoJS.AES.decrypt(
      user.twoFactorTempSecret,
      process.env.TWO_FACTOR_SECRET!,
    );

    const tempSecret = bytes.toString(CryptoJS.enc.Utf8).trim();
    console.log("TEMPSECRETE++++++++++", tempSecret);
    const serverToken = speakeasy.totp({
      secret: tempSecret,
      encoding: "base32",
    });

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token,
      window: 2,
    });
    console.log("VERIFIED SECRETE++++++++++", verified);

    if (!verified) throw new Error("Invalid code");

    const res = await TwoFARepository.update(
      userId,
      tenant.id,
      user.twoFactorTempSecret,
    );
    console.log("TWO FA SERVICE", res);
    return res;
  }
}

export default TwoFAService;
