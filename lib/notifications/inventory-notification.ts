import NotificationService from "@/lib/notifications/notification.service";
import { prisma } from "@/utils/prisma";

const LOW_STOCK_LIMIT = 5;

export async function checkInventoryNotification(productId: string) {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      stock: true,
      vendorId: true,
    },
  });

  if (!product?.vendorId) return;

  if (product.stock === 0) {
    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "outOfStock",
      type: "INVENTORY",
      title: "Out of Stock",
      message: `"${product.name}" is now out of stock.`,
      link: `/vendor/products/${product.id}`,
      metadata: {
        productId: product.id,
      },
    });

    return;
  }

  if (product.stock <= LOW_STOCK_LIMIT) {
    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "lowStock",
      type: "INVENTORY",
      title: "Low Stock",
      message: `"${product.name}" has only ${product.stock} item${product.stock === 1 ? "" : "s"} remaining.`,
      link: `/vendor/products/${product.id}`,
      metadata: {
        productId: product.id,
      },
    });
  }
}
