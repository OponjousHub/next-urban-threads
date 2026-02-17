import TwoFAService from "./2FA.service";

class TwoFAController {
  static async verify(token: string) {
    console.log("VERIFY-CONTROLLER HIIIIIT ++++++++", token);

    return await TwoFAService.verify(token);
  }
}
export default TwoFAController;
