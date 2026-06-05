import { prisma } from "@/utils/prisma";

export async function getVendorApplication(userId: string) {
  return prisma.vendorApplication.findFirst({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}
