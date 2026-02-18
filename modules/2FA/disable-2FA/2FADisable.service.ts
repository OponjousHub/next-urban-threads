import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import DisableTwoFARepository from "./2FADisable.repository";
import CryptoJS from "crypto-js";
import speakeasy from "speakeasy";

class DisableTwoFAService {
  static async verify(token: string) {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!userId) {
      throw new Error("Unauthorized");
    }
    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const user = await DisableTwoFARepository.findUserForDisable2FA(
      userId,
      tenant.id,
    );

    if (!user?.twoFactorSecret) {
      throw new Error("2FA not enabled");
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: "base32",
      token,
    });

    if (!isValid) {
      throw new Error("Invalid code");
    }

    // if (!user?.twoFactorTempSecret) {
    //   throw new Error("No 2FA setup in progress");
    // }

    // if (
    //   !user.twoFactorTempSecretExpiresAt ||
    //   user.twoFactorTempSecretExpiresAt < new Date()
    // ) {
    //   throw new Error("2FA setup expired");
    // }

    // Decrypt temporary secret
    const bytes = CryptoJS.AES.decrypt(
      user.twoFactorTempSecret,
      process.env.TWO_FACTOR_SECRET!,
    );

    const tempSecret = bytes.toString(CryptoJS.enc.Utf8).trim();

    const verified = speakeasy.totp.verify({
      secret: tempSecret,
      encoding: "base32",
      token,
      window: 2,
    });

    if (!verified) throw new Error("Invalid code");

    const res = await DisableTwoFARepository.update(userId, tenant.id);
    return res;
  }
}

export default DisableTwoFAService;
