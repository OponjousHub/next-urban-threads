import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import TwoFARepository from "./2FA.repository";
import CryptoJS from "crypto-js";
import speakeasy from "speakeasy";
import { generateRecoveryCodes } from "@/app/lib/recoveryCode";
import { hashCode } from "@/app/lib/recoveryCode";

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

    const user = await TwoFARepository.findUserFor2FA(userId, tenant.id);

    if (!user?.twoFactorTempSecret) {
      throw new Error("No 2FA setup in progress");
    }

    if (
      !user.twoFactorTempSecretExpiresAt ||
      user.twoFactorTempSecretExpiresAt < new Date()
    ) {
      throw new Error("2FA setup expired");
    }

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

    let reactivated = false;
    if (user.status === "DEACTIVATED") {
      reactivated = true;
    }

    // ADDING RECOVERY CODES
    const recoveryCodes = generateRecoveryCodes(10);

    const hashedCodes = recoveryCodes.map((code) => hashCode(code));

    await TwoFARepository.saveRecovery(
      userId,
      tenant.id,
      hashedCodes,
      user.twoFactorTempSecret,
    );

    const res = await TwoFARepository.update(
      userId,
      tenant.id,
      user.twoFactorTempSecret,
    );
    return {
      res,
      recoveryCodes,
      reactivated,
    };
  }
}

export default TwoFAService;
