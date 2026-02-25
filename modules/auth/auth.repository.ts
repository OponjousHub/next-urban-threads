import { prisma } from "@/utils/prisma";

export const authRepository = {
  login(email: string, tenantId: string) {
    return prisma.user.findUnique({
      where: { email, tenantId },
    });
  },

  createSession(
    userId: string,
    tenantId: string,
    userAgent: string,
    ip: string,
    deviceLabel: string,
  ) {
    return prisma.session.create({
      data: {
        userId,
        tenantId,
        userAgent,
        ipAddress: ip,
        deviceName: deviceLabel,
      },
    });
  },

  getUserSessions(userId: string, tenantId: string) {
    return prisma.session.findMany({
      where: { userId, tenantId },
      orderBy: { createdAt: "desc" },
    });
  },

  update(userId: string, tenantId: string) {
    return prisma.user.update({
      where: { id: userId, tenantId },
      data: {
        status: "ACTIVE",
        deactivatedAt: null,
      },
    });
  },
};
