import { prisma } from "@/utils/prisma";

class TwoFARepository {
  static async verify(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId },
    });

    return user;
  }

  static async update(userId: string, tenantId: string, tempSecret: string) {
    await prisma.user.update({
      where: { id: userId, tenantId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: tempSecret,
        twoFactorTempSecret: null,
        twoFactorTempSecretExpiresAt: null,
      },
    });
  }
}

export default TwoFARepository;
