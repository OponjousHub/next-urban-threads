import { prisma } from "@/utils/prisma";
import { OrderStatus } from "@prisma/client";

export async function getUserDashboardStats(userId: string) {
  const [
    totalOrders,
    pendingOrders,
    totalSpentAgg,
    recentOrders,
    defaultAddress,
    user,
    addresses,
  ] = await Promise.all([
    prisma.order.count({
      where: { userId },
    }),

    prisma.order.count({
      where: {
        userId,
        status: {
          in: [OrderStatus.PENDING, OrderStatus.PROCESSING],
        },
      },
    }),

    prisma.order.aggregate({
      where: {
        userId,
        status: OrderStatus.PAID,
      },
      _sum: {
        totalAmount: true,
      },
    }),

    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,

      include: {
        shippingAddress: true,
        items: {
          include: {
            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    }),

    prisma.address.findFirst({
      where: { userId, isDefault: true },
    }),

    prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        createdAt: true,
        status: true,
      },
    }),

    prisma.address.findMany({
      where: { userId: userId, isTemporary: false, isDeleted: false },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  console.dir(recentOrders[0]?.items[0], { depth: null });
  const serializedRecentOrders = recentOrders.map((order) => {
    return {
      id: order.id,
      userId: order.userId,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentProvider: order.paymentProvider,
      paymentReference: order.paymentReference,
      currency: order.currency,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt.toISOString(), // ✅ Date → string
      totalAmount: order.totalAmount.toNumber(), // ✅ Decimal → number

      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price.toNumber(),
        product: item.product
          ? {
              name: item.product.name,
              images: item.product.images,
            }
          : null,
      })),
    };
  });

  return {
    totalOrders,
    pendingOrders,
    totalSpent: totalSpentAgg._sum.totalAmount?.toNumber() ?? 0,
    recentOrders: serializedRecentOrders,
    defaultAddress,
    user,
    addresses,
  };
}
