import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import DisableTwoFARepository from "./2FADisable.repository";
import CryptoJS from "crypto-js";
import speakeasy from "speakeasy";
import { decrypt2FASecret } from "@/lib/decrypt";

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

    /* -------- DECRYPT SECRET -------- */

    // const bytes = CryptoJS.AES.decrypt(
    //   user.twoFactorSecret,
    //   process.env.TWO_FACTOR_SECRET!,
    // );

    // const decryptedSecret = bytes.toString(CryptoJS.enc.Utf8).trim();
    const decryptedSecret = decrypt2FASecret(user.twoFactorSecret);

    if (!/^[A-Z2-7]+=*$/.test(decryptedSecret)) {
      throw new Error("Corrupted 2FA secret");
    }

    if (!decryptedSecret) {
      throw new Error("Invalid 2FA secret");
    }

    /* -------- VERIFY OTP -------- */

    const verified = speakeasy.totp.verify({
      secret: decryptedSecret,
      encoding: "base32",
      token,
      window: 2, // good choice 👍
    });

    if (!verified) {
      throw new Error("Invalid code");
    }

    /* -------- DISABLE 2FA -------- */

    return await DisableTwoFARepository.update(userId, tenant.id);
  }
}
export default DisableTwoFAService;
