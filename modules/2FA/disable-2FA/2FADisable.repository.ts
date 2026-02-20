import { prisma } from "@/utils/prisma";

class DisableTwoFARepository {
  static async findUserForDisable2FA(userId: string, tenantId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId },
    });

    return user;
  }

  static async update(userId: string, tenantId: string) {
    return await prisma.user.update({
      where: { id: userId, tenantId },
      data: {
        twoFactorEnabled: false,
        recoveryCodes: [],
      },
    });
  }
}

export default DisableTwoFARepository;
