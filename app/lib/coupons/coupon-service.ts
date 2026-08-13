import { Prisma, StoreMode } from "@prisma/client";
import { prisma } from "@/utils/prisma";

export type CouponCartItem = {
  productId: string;
  quantity: number;
};

export type CouponLine = {
  productId: string;
  vendorId: string | null;
  quantity: number;
  remaining: Prisma.Decimal;
};

export type CouponCalculation = {
  couponId: string;
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  vendorId: string | null;
  eligibleSubtotal: Prisma.Decimal;
  discountAmount: Prisma.Decimal;
};

export async function getCouponCartLines(
  tenantId: string,
  items: CouponCartItem[],
): Promise<CouponLine[]> {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("Cart is empty.");
  }

  const validItems = items.filter(
    (item) =>
      typeof item?.productId === "string" &&
      Number.isInteger(Number(item.quantity)) &&
      Number(item.quantity) > 0,
  );

  if (validItems.length !== items.length) {
    throw new Error("Invalid cart items.");
  }

  const productIds = [...new Set(validItems.map((item) => item.productId))];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds,
      },
      tenantId,
    },
    select: {
      id: true,
      price: true,
      vendorId: true,
    },
  });

  if (products.length !== productIds.length) {
    throw new Error("One or more products could not be found.");
  }

  const productMap = new Map(products.map((product) => [product.id, product]));

  return validItems.map((item) => {
    const product = productMap.get(item.productId);

    if (!product) {
      throw new Error("Product not found.");
    }

    const quantity = Number(item.quantity);

    return {
      productId: product.id,
      vendorId: product.vendorId,
      quantity,
      remaining: new Prisma.Decimal(product.price).mul(quantity),
    };
  });
}

export function getCartSubtotal(lines: CouponLine[]) {
  return lines.reduce(
    (sum, line) => sum.plus(line.remaining),
    new Prisma.Decimal(0),
  );
}

function getEligibleLineIndexes(
  coupon: {
    vendorId: string | null;
  },
  lines: CouponLine[],
) {
  return lines
    .map((line, index) => ({ line, index }))
    .filter(({ line }) => {
      if (!coupon.vendorId) {
        return true;
      }

      return line.vendorId === coupon.vendorId;
    })
    .filter(({ line }) => line.remaining.greaterThan(0))
    .map(({ index }) => index);
}

export function validateCouponForCart(
  coupon: {
    id: string;
    code: string;
    type: "PERCENTAGE" | "FIXED";
    value: Prisma.Decimal;
    minimumAmount: Prisma.Decimal | null;
    usageLimit: number | null;
    usedCount: number;
    startsAt: Date | null;
    expiresAt: Date | null;
    active: boolean;
    vendorId: string | null;
  },
  lines: CouponLine[],
  storeMode: StoreMode,
  now = new Date(),
): CouponCalculation {
  if (!coupon.active) {
    throw new Error(`Coupon "${coupon.code}" is inactive.`);
  }

  if (coupon.startsAt && coupon.startsAt > now) {
    throw new Error(`Coupon "${coupon.code}" has not started yet.`);
  }

  if (coupon.expiresAt && coupon.expiresAt < now) {
    throw new Error(`Coupon "${coupon.code}" has expired.`);
  }

  if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
    throw new Error(`Coupon "${coupon.code}" usage limit reached.`);
  }

  // Vendor coupons are completely unavailable in SINGLE_VENDOR mode.
  if (storeMode === "SINGLE_VENDOR" && coupon.vendorId) {
    throw new Error(`Coupon "${coupon.code}" is not available.`);
  }

  const eligibleIndexes = getEligibleLineIndexes(coupon, lines);

  if (eligibleIndexes.length === 0) {
    throw new Error(
      coupon.vendorId
        ? `Coupon "${coupon.code}" is only valid for products from its assigned vendor.`
        : `Coupon "${coupon.code}" is not applicable to this cart.`,
    );
  }

  const eligibleSubtotal = eligibleIndexes.reduce(
    (sum, index) => sum.plus(lines[index].remaining),
    new Prisma.Decimal(0),
  );

  if (
    coupon.minimumAmount !== null &&
    eligibleSubtotal.lessThan(coupon.minimumAmount)
  ) {
    throw new Error(
      `Coupon "${coupon.code}" requires a minimum eligible order amount of ${coupon.minimumAmount}.`,
    );
  }

  let discountAmount = new Prisma.Decimal(0);

  if (coupon.type === "PERCENTAGE") {
    discountAmount = eligibleSubtotal.mul(
      new Prisma.Decimal(coupon.value).div(100),
    );
  } else {
    discountAmount = new Prisma.Decimal(coupon.value);

    if (discountAmount.greaterThan(eligibleSubtotal)) {
      discountAmount = eligibleSubtotal;
    }
  }

  if (discountAmount.greaterThan(eligibleSubtotal)) {
    discountAmount = eligibleSubtotal;
  }

  return {
    couponId: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    vendorId: coupon.vendorId,
    eligibleSubtotal,
    discountAmount,
  };
}

/**
 * Applies a discount to the eligible cart lines proportionally.
 *
 * This is what makes stacking behave correctly.
 *
 * Example:
 *
 * €777
 * WELCOME10 -> -€77.70
 * Remaining €699.30
 *
 * SAVE5 then sees the already-discounted eligible amount.
 */
export function applyCouponDiscountToLines(
  lines: CouponLine[],
  coupon: {
    vendorId: string | null;
  },
  discountAmount: Prisma.Decimal,
) {
  if (discountAmount.lessThanOrEqualTo(0)) {
    return;
  }

  const eligibleIndexes = getEligibleLineIndexes(coupon, lines);

  if (eligibleIndexes.length === 0) {
    return;
  }

  const eligibleSubtotal = eligibleIndexes.reduce(
    (sum, index) => sum.plus(lines[index].remaining),
    new Prisma.Decimal(0),
  );

  if (eligibleSubtotal.lessThanOrEqualTo(0)) {
    return;
  }

  for (const index of eligibleIndexes) {
    const line = lines[index];

    const share = line.remaining.div(eligibleSubtotal);

    const lineDiscount = discountAmount.mul(share);

    line.remaining = Prisma.Decimal.max(
      new Prisma.Decimal(0),
      line.remaining.minus(lineDiscount),
    );
  }
}

export function serializeCoupon(coupon: {
  id: string;
  code: string;
  description: string | null;
  type: "PERCENTAGE" | "FIXED";
  value: Prisma.Decimal;
  minimumAmount?: Prisma.Decimal | null;
  vendorId?: string | null;
}) {
  return {
    id: coupon.id,
    code: coupon.code,
    description: coupon.description,
    type: coupon.type,
    value: Number(coupon.value),
    minimumAmount:
      coupon.minimumAmount != null ? Number(coupon.minimumAmount) : null,
    vendorId: coupon.vendorId ?? null,
  };
}
