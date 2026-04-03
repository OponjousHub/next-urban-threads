import { prisma } from "@/utils/prisma";
import { OrderStatus } from "@prisma/client";

export async function getRecentOrders(tenantId: string) {
  return prisma.order.findMany({
    where: {
      status: {
        in: [
          OrderStatus.SHIPPED,
          OrderStatus.DELIVERED,
          OrderStatus.CANCELLED,
          OrderStatus.PENDING,
          OrderStatus.PROCESSING,
        ],
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
