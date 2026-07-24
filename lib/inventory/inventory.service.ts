import { Prisma } from "@prisma/client";
import { prisma } from "@/utils/prisma";
import { checkInventoryNotification } from "../notifications/inventory-notification";

type DecreaseStockInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  tx?: Prisma.TransactionClient;
};

type IncreaseStockInput = {
  productId: string;
  variantId?: string | null;
  quantity: number;
  tx?: Prisma.TransactionClient;
};

type AdjustStockInput = {
  productId: string;
  variantId?: string | null;
  stock: number;
  tx?: Prisma.TransactionClient;
};

export default class InventoryService {
  /**
   * Reduce stock after purchase
   */
  static async decreaseStock({
    productId,
    variantId,
    quantity,
    tx,
  }: DecreaseStockInput) {
    if (tx) {
      const updated = await this.performDecreaseStock(
        tx,
        productId,
        variantId,
        quantity,
      );

      await checkInventoryNotification({
        productId,
        variantId,
      });

      return updated;
    }

    const updated = await prisma.$transaction(async (trx) => {
      return this.performDecreaseStock(trx, productId, variantId, quantity);
    });

    return updated;
  }

  // Helper for decreaseStock

  private static async performDecreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) {
    if (!variantId) {
      throw new Error("Variant ID is required.");
    }

    // Get the purchased variant
    const variant = await db.productVariant.findUnique({
      where: {
        id: variantId,
      },
      select: {
        id: true,
        stock: true,
        productId: true,
      },
    });

    if (!variant) {
      throw new Error("Product variant not found.");
    }

    if (variant.stock < quantity) {
      throw new Error("Insufficient stock.");
    }

    // Reduce variant stock
    const updatedVariant = await db.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: variant.stock - quantity,
      },
    });

    // Calculate remaining stock from ALL variants
    const variants = await db.productVariant.findMany({
      where: {
        productId,
      },
      select: {
        stock: true,
      },
    });

    const totalStock = variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );

    await checkInventoryNotification({
      productId,
      variantId: updatedVariant.id,
    });

    // Update parent product
    return db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: totalStock,
        instock: totalStock > 0,
      },
    });
  }

  /**
   * Restore stock after refund/return
   */
  static async increaseStock({
    productId,
    quantity,
    variantId,
    tx,
  }: IncreaseStockInput) {
    if (tx) {
      return this.performIncreaseStock(tx, productId, variantId, quantity);
    }

    return prisma.$transaction(async (trx) => {
      return this.performIncreaseStock(trx, productId, variantId, quantity);
    });
  }

  // Helper for IncreaseStock
  private static async performIncreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) {
    if (!variantId) {
      throw new Error("Variant ID is required.");
    }

    const variant = await db.productVariant.findUnique({
      where: {
        id: variantId,
      },
      select: {
        id: true,
        stock: true,
      },
    });

    if (!variant) {
      throw new Error("Product variant not found.");
    }

    // Restore variant stock
    await db.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: variant.stock + quantity,
      },
    });

    // Recalculate total product stock
    const variants = await db.productVariant.findMany({
      where: {
        productId,
      },
      select: {
        stock: true,
      },
    });

    const totalStock = variants.reduce(
      (sum, variant) => sum + variant.stock,
      0,
    );

    return db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: totalStock,
        instock: totalStock > 0,
      },
    });
  }

  /**
   * Manual stock adjustment
   */
  static async adjustStock({
    productId,
    variantId,
    stock,
    tx,
  }: AdjustStockInput) {
    if (tx) {
      const updated = await this.performAdjustStock(tx, productId, stock);

      await checkInventoryNotification({
        productId,
        variantId,
      });

      return updated;
    }

    const updated = await prisma.$transaction(async (trx) => {
      return this.performAdjustStock(trx, productId, stock);
    });

    await checkInventoryNotification({
      productId,
      variantId,
    });

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
