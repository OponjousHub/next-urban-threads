import { prisma } from "@/utils/prisma";

class TwoFARepository {
  static async findUserFor2FA(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId },
    });

    return user;
  }

  // static async update(userId: string, tenantId: string, tempSecret: string) {
  //   console.log("FINALLY REEEEPPPPOOOO+++++++++++++", tempSecret);
  //   await prisma.user.update({
  //     where: { id: userId, tenantId },
  //     data: {
  //       twoFactorEnabled: true,
  //       twoFactorSecret: tempSecret,
  //       twoFactorTempSecret: null,
  //       twoFactorTempSecretExpiresAt: null,
  //     },
  //   });
  // }

  static async update(
    userId: string,
    tenantId: string,
    encryptedSecret: string,
  ) {
    await prisma.user.update({
      where: { id: userId, tenantId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: encryptedSecret,
        twoFactorTempSecret: null,
        twoFactorTempSecretExpiresAt: null,
      },
    });
  }
}

export default TwoFARepository;
