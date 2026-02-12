import { prisma } from "@/utils/prisma";

export const authRepository = {
  login(email: string, tenantId: string) {
    return prisma.user.findUnique({
      where: { email, tenantId },
    });
  },
};
