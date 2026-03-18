import { prisma } from "@/utils/prisma";

export async function getLowStockProducts(tenantId: string) {
  return prisma.product.findMany({
    where: {
      tenantId,
      stock: { lt: 5 },
    },
    take: 5,
    select: {
      id: true,
      name: true,
      stock: true,
    },
  });
}
