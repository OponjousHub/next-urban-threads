import { prisma } from "@/utils/prisma";

export async function getRecentUsers(tenantId: string) {
  return prisma.user.findMany({
    where: {
      tenantId,
      role: "USER",
    },
    take: 3,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      createdAt: true,
    },
  });
}
