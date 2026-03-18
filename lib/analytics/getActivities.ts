import { prisma } from "@/utils/prisma";
import { getRecentOrders } from "../data/orders";
import { getRecentUsers } from "../data/users";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLowStockProducts } from "../data/products";

export async function getActivities(tenantId: string) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  // Run queries in parallel
  const [recentOrders, recentUsers, lowStock] = await Promise.all([
    getRecentOrders(tenant.id),
    getRecentUsers(tenant.id),
    getLowStockProducts(tenant.id),
  ]);

  // Merge into activities
  const activities = [
    ...recentOrders.map((order) => ({
      id: `order-${order.id}`,
      type: "order",
      message: `${order.user?.name || "Guest"} placed an order ($${Number(
        order.totalAmount,
      )})`,
      time: order.createdAt,
    })),

    ...recentUsers.map((user) => ({
      id: `user-${user.id}`,
      type: "user",
      message: `${user.name || "New user"} created an account`,
      time: user.createdAt,
    })),

    ...lowStock.map((product) => ({
      id: `stock-${product.id}`,
      type: "stock",
      message: `${product.name} stock running low (${product.stock} left)`,
      time: new Date(),
    })),
  ]
    .sort((a, b) => b.time.getTime() - a.time.getTime())
    .slice(0, 6);

  return activities;
}
