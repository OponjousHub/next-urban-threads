import { prisma } from "@/utils/prisma";

type CartItem = {
  productId: string;
  quantity: number;
};

type CalculateShippingInput = {
  tenantId: string;
  state: string;
  items: CartItem[];
};

export type AvailableShippingMethod = {
  rateId: string;
  methodId: string;
  method: string;
  estimate: string | null;
  amount: number;
};

export async function calculateShipping({
  tenantId,
  state,
  items,
}: CalculateShippingInput): Promise<AvailableShippingMethod[]> {
  // ----------------------------------------
  // 1. Calculate cart subtotal
  // ----------------------------------------

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: items.map((i) => i.productId),
      },
    },
    select: {
      id: true,
      price: true,
      weight: true,
    },
  });

  let subtotal = 0;
  let totalWeight = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) continue;

    subtotal += Number(product.price) * item.quantity;

    totalWeight += (product.weight ?? 0) * item.quantity;
  }

  // ----------------------------------------
  // 2. Find shipping zone
  // ----------------------------------------

  const zone = await prisma.shippingZone.findFirst({
    where: {
      tenantId,
      active: true,
      OR: [
        {
          states: {
            has: state,
          },
        },
        {
          isDefault: true,
        },
      ],
    },
  });

  if (!zone) {
    return [];
  }

  // ----------------------------------------
  // 3. Load active shipping rates
  // ----------------------------------------

  const rates = await prisma.shippingRate.findMany({
    where: {
      tenantId,
      zoneId: zone.id,
      active: true,
      method: {
        active: true,
      },
    },
    include: {
      method: true,
    },
    orderBy: [
      {
        priority: "asc",
      },
      {
        amount: "asc",
      },
    ],
  });

  // ----------------------------------------
  // 4. Apply conditions
  // ----------------------------------------

  const available: AvailableShippingMethod[] = [];

  for (const rate of rates) {
    if (rate.minOrderAmount && subtotal < Number(rate.minOrderAmount)) {
      continue;
    }

    if (rate.maxOrderAmount && subtotal > Number(rate.maxOrderAmount)) {
      continue;
    }

    if (rate.minWeight !== null && totalWeight < rate.minWeight) {
      continue;
    }

    if (rate.maxWeight !== null && totalWeight > rate.maxWeight) {
      continue;
    }

    available.push({
      rateId: rate.id,
      methodId: rate.methodId,
      method: rate.method.name,
      estimate: rate.method.estimatedDelivery,
      amount: Number(rate.amount),
    });
  }

  return available;
}
