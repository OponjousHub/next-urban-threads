import { prisma } from "@/utils/prisma";

export async function getDefaultTenant() {
  return prisma.tenant.findFirst({
    where: {
      isDefault: true,
    },
  });
}
