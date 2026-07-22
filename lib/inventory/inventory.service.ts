import { Prisma } from "@prisma/client";
import { prisma } from "@/utils/prisma";
import { checkInventoryNotification } from "../notifications/inventory-notification";

type DecreaseStockInput = {
  productId: string;
  quantity: number;
  tx?: Prisma.TransactionClient;
};

type IncreaseStockInput = {
  productId: string;
  quantity: number;
  tx?: Prisma.TransactionClient;
};

type AdjustStockInput = {
  productId: string;
  stock: number;
  tx?: Prisma.TransactionClient;
};

export default class InventoryService {
  /**
   * Reduce stock after purchase
   */
  static async decreaseStock({ productId, quantity, tx }: DecreaseStockInput) {
    if (tx) {
      const updated = await this.performDecreaseStock(tx, productId, quantity);

      await checkInventoryNotification(productId);

      return updated;
    }

    const updated = await prisma.$transaction(async (trx) => {
      return this.performDecreaseStock(trx, productId, quantity);
    });

    await checkInventoryNotification(productId);

    return updated;
  }

  // Helper for decreaseStock

  private static async performDecreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    const product = await db.product.findUnique({
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

    const remainingStock = product.stock - quantity;

    return db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: remainingStock,
        instock: remainingStock > 0,
      },
    });
  }

  /**
   * Restore stock after refund/return
   */
  static async increaseStock({ productId, quantity, tx }: IncreaseStockInput) {
    if (tx) {
      return this.performIncreaseStock(tx, productId, quantity);
    }

    return prisma.$transaction(async (trx) => {
      return this.performIncreaseStock(trx, productId, quantity);
    });
  }

  // Helper for IncreaseStock
  private static async performIncreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    quantity: number,
  ) {
    const product = await db.product.findUnique({
      where: {
        id: productId,
      },
      select: {
        stock: true,
      },
    });

    if (!product) {
      throw new Error("Product not found.");
    }

    const newStock = product.stock + quantity;

    const updated = db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: newStock,
        instock: true,
      },
    });

    await checkInventoryNotification(productId);

    return updated;
  }

  /**
   * Manual stock adjustment
   */
  static async adjustStock({ productId, stock, tx }: AdjustStockInput) {
    if (tx) {
      const updated = await this.performAdjustStock(tx, productId, stock);

      await checkInventoryNotification(productId);

      return updated;
    }

    const updated = await prisma.$transaction(async (trx) => {
      return this.performAdjustStock(trx, productId, stock);
    });

    await checkInventoryNotification(productId);

    return updated;
  }

  // Helper for adjustStock
  private static async performAdjustStock(
    db: Prisma.TransactionClient,
    productId: string,
    stock: number,
  ) {
    return db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock,
        instock: stock > 0,
      },
    });
  }
}
