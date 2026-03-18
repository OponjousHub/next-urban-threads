import { prisma } from "@/utils/prisma";

export async function getRecentOrders(tenantId: string) {
  return prisma.order.findMany({
    // where: { tenantId },
    // take: 5,
    // orderBy: { createdAt: "desc" },
    // select: {
    //   id: true,
    //   totalAmount: true,
    //   createdAt: true,
    //   user: {
    //     select: { name: true, email: true },
    //   },
    // },
    where: {
      status: {
        in: ["PAID", "SHIPPED", "DELIVERED"],
      },
      tenantId: tenantId,
    },
    select: {
      userId: true,
      id: true,
      totalAmount: true,
      createdAt: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });
}
