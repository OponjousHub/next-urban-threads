import NotificationService from "@/lib/notifications/notification.service";
import { prisma } from "@/utils/prisma";

const LOW_STOCK_LIMIT = 5;

export async function checkInventoryNotification({
  productId,
  variantId,
}: {
  productId: string;
  variantId?: string | null;
}) {
  if (!variantId) {
    return;
  }

  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      variants: true,
    },
  });

  if (!product || !product.vendorId) {
    return;
  }

  const variant = product.variants.find((v) => v.id === variantId);

  if (!variant) {
    return;
  }

  const variantName = [variant.color, variant.size].filter(Boolean).join(" / ");

  // OUT OF STOCK
  if (variant.stock === 0) {
    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "outOfStock",
      type: "OUT_OF_STOCK",
      title: "Out of Stock",
      message: `${product.name}${variantName ? ` (${variantName})` : ""} is now out of stock.`,
      link: `/vendor/products/${product.id}`,
      dedupeKey: `out-of-stock-${variant.id}`,
      metadata: {
        productId: product.id,
        variantId: variant.id,
        color: variant.color,
        size: variant.size,
      },
    });

    return;
  }

  // LOW STOCK
  if (variant.stock > 0 && variant.stock <= LOW_STOCK_LIMIT) {
    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "lowStock",
      type: "LOW_STOCK",
      title: "Low Stock Alert",
      message: `${product.name}${variantName ? ` (${variantName})` : ""} has only ${variant.stock} item${variant.stock === 1 ? "" : "s"} remaining.`,
      link: `/vendor/products/${product.id}`,
      dedupeKey: `low-stock-${variant.id}`,
      metadata: {
        productId: product.id,
        variantId: variant.id,
        color: variant.color,
        size: variant.size,
        stock: variant.stock,
      },
    });
  }
}
