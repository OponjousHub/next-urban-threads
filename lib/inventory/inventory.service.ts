import { prisma } from "@/utils/prisma";
import { checkInventoryNotification } from "../notifications/inventory-notification";

type DecreaseStockInput = {
  productId: string;
  quantity: number;
};

type IncreaseStockInput = {
  productId: string;
  quantity: number;
};

type AdjustStockInput = {
  productId: string;
  stock: number;
};

export default class InventoryService {
  /**
   * Reduce inventory after a successful purchase
   */
  static async decreaseStock({ productId, quantity }: DecreaseStockInput) {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    if (product.stock < quantity) {
      throw new Error("Insufficient stock.");
    }

    const updated = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          decrement: quantity,
        },
      },
    });

    // Keep instock in sync
    if (updated.stock <= 0) {
      await prisma.product.update({
        where: {
          id: productId,
        },
        data: {
          instock: false,
        },
      });
    }

    await checkInventoryNotification(productId);

    return updated;
  }

  /**
   * Restore inventory (returns, cancelled orders)
   */
  static async increaseStock({ productId, quantity }: IncreaseStockInput) {
    const updated = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          increment: quantity,
        },
        instock: true,
      },
    });

    return updated;
  }

  /**
   * Manual stock adjustment by vendor/admin
   */
  static async adjustStock({ productId, stock }: AdjustStockInput) {
    const updated = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        stock,
        instock: stock > 0,
      },
    });

    await checkInventoryNotification(productId);

    return updated;
  }
}
