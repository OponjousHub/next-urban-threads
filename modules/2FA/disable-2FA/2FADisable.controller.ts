import DisableTwoFAService from "./2FADisable.service";

class DisableTwoFAController {
  static async verify(token: string) {
    return await DisableTwoFAService.verify(token);
  }
}
export default DisableTwoFAController;
