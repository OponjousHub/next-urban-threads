import TwoFAService from "./2FA.service";

class TwoFAController {
  static async verify(token: string) {
    const result = await TwoFAService.verify(token);
    return result;
  }
}
export default TwoFAController;
