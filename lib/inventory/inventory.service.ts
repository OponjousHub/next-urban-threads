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
   * =========================================================
   * REDUCE STOCK AFTER PURCHASE
   *
   * Supports:
   * 1. Products with variants
   * 2. Products without variants
   * =========================================================
   */
  static async decreaseStock({
    productId,
    variantId,
    quantity,
    tx,
  }: DecreaseStockInput) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

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

    await checkInventoryNotification({
      productId,
      variantId,
    });

    return updated;
  }

  /**
   * =========================================================
   * INTERNAL DECREASE STOCK
   * =========================================================
   */
  private static async performDecreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) {
    /**
     * ---------------------------------------------------------
     * NON-VARIANT PRODUCT
     * ---------------------------------------------------------
     *
     * No variantId means this is a normal product whose stock
     * lives directly on Product.stock.
     */
    if (!variantId) {
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

      const newStock = product.stock - quantity;

      return db.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: newStock,
          instock: newStock > 0,
        },
      });
    }

    /**
     * ---------------------------------------------------------
     * VARIANT PRODUCT
     * ---------------------------------------------------------
     */

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

    /**
     * Make sure the variant actually belongs to the product
     * being purchased.
     */
    if (variant.productId !== productId) {
      throw new Error("Product variant does not belong to this product.");
    }

    if (variant.stock < quantity) {
      throw new Error("Insufficient stock.");
    }

    /**
     * Reduce variant stock.
     */
    const updatedVariant = await db.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: variant.stock - quantity,
      },
    });

    /**
     * Recalculate parent product stock from ALL variants.
     */
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

    /**
     * Update parent product.
     */
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
   * =========================================================
   * RESTORE STOCK AFTER REFUND / RETURN
   *
   * Supports:
   * 1. Products with variants
   * 2. Products without variants
   * =========================================================
   */
  static async increaseStock({
    productId,
    quantity,
    variantId,
    tx,
  }: IncreaseStockInput) {
    if (quantity <= 0) {
      throw new Error("Quantity must be greater than zero.");
    }

    if (tx) {
      const updated = await this.performIncreaseStock(
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
      return this.performIncreaseStock(trx, productId, variantId, quantity);
    });

    await checkInventoryNotification({
      productId,
      variantId,
    });

    return updated;
  }

  /**
   * =========================================================
   * INTERNAL INCREASE STOCK
   * =========================================================
   */
  private static async performIncreaseStock(
    db: Prisma.TransactionClient,
    productId: string,
    variantId: string | null | undefined,
    quantity: number,
  ) {
    /**
     * ---------------------------------------------------------
     * NON-VARIANT PRODUCT
     * ---------------------------------------------------------
     */
    if (!variantId) {
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

      const newStock = product.stock + quantity;

      return db.product.update({
        where: {
          id: productId,
        },
        data: {
          stock: newStock,
          instock: newStock > 0,
        },
      });
    }

    /**
     * ---------------------------------------------------------
     * VARIANT PRODUCT
     * ---------------------------------------------------------
     */

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

    if (variant.productId !== productId) {
      throw new Error("Product variant does not belong to this product.");
    }

    /**
     * Restore variant stock.
     */
    await db.productVariant.update({
      where: {
        id: variantId,
      },
      data: {
        stock: variant.stock + quantity,
      },
    });

    /**
     * Recalculate total product stock.
     */
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
   * =========================================================
   * MANUAL STOCK ADJUSTMENT
   *
   * This adjusts the parent Product.stock.
   * =========================================================
   */
  static async adjustStock({
    productId,
    variantId,
    stock,
    tx,
  }: AdjustStockInput) {
    if (stock < 0) {
      throw new Error("Stock cannot be negative.");
    }

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

  /**
   * =========================================================
   * INTERNAL MANUAL STOCK ADJUSTMENT
   * =========================================================
   */
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
