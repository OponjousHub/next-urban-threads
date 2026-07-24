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
      type: "INVENTORY",
      title: "Out of Stock",
      message: `${product.name}
${[variant.color, variant.size].filter(Boolean).join(" / ")}
is now out of stock.`,
      link: `/vendor/products/${product.id}`,
      metadata: {
        productId: product.id,
        variantId: variant.id,
      },
    });

    return;
  }

  // LOW STOCK
  if (variant.stock > 0 && variant.stock <= LOW_STOCK_LIMIT) {
    await NotificationService.notify({
      vendorId: product.vendorId,
      setting: "lowStock",
      type: "INVENTORY",
      title: "Low Stock",
      message: `${product.name}
${[variant.color, variant.size].filter(Boolean).join(" / ")}
Only ${variant.stock} left.`,
      link: `/vendor/products/${product.id}`,
      metadata: {
        productId: product.id,
        variantId: variant.id,
      },
    });
  }
}
