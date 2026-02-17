import { prisma } from "@/utils/prisma";

class TwoFARepository {
  static async findUserFor2FA(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId },
    });

    return user;
  }

  static async update(
    userId: string,
    tenantId: string,
    encryptedSecret: string,
  ) {
    return await prisma.user.update({
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
