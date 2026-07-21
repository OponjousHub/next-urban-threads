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
    const updatedProduct = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: {
          id: productId,
        },
        select: {
          id: true,
          stock: true,
          instock: true,
        },
      });

      if (!product) {
        throw new Error("Product not found.");
      }

      if (product.stock < quantity) {
        throw new Error("Insufficient stock.");
      }

      const remainingStock = product.stock - quantity;

      const updated = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: remainingStock,
          instock: remainingStock > 0,
        },
      });

      // Keep instock synchronized
      if (updated.stock <= 0 && updated.instock) {
        await tx.product.update({
          where: {
            id: productId,
          },
          data: {
            instock: false,
          },
        });

        updated.instock = false;
      }

      return updated;
    });

    // Notifications happen AFTER the transaction succeeds
    await checkInventoryNotification(productId);

    return updatedProduct;
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
