import TwoFAService from "./2FA.service";

class TwoFAController {
  static async verify(token: string) {
    return await TwoFAService.verify(token);
  }
}
export default TwoFAController;
