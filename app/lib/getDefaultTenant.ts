import { prisma } from "@/utils/prisma";

export async function getDefaultTenant() {
  return prisma.tenant.findUnique({
    where: { slug: "urban-threads" },
  });
}
