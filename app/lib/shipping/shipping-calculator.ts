import { prisma } from "@/utils/prisma";

type CartItem = {
  productId: string;
  quantity: number;
};

type CalculateShippingInput = {
  tenantId: string;
  country: string;
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
  country,
  state,
  items,
}: CalculateShippingInput): Promise<AvailableShippingMethod[]> {
  // ----------------------------------------
  // 1. Calculate cart subtotal
  // ----------------------------------------

  const products = await prisma.product.findMany({
    where: {
      tenantId,
      id: {
        in: items.map((i) => i.productId),
      },
    },
    select: {
      id: true,
      price: true,
    },
  });

  let subtotal = 0;

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);

    if (!product) continue;

    subtotal += Number(product.price) * item.quantity;
  }

  // ----------------------------------------
  // 2. Find matching shipping zone
  // ----------------------------------------

  const zones = await prisma.shippingZone.findMany({
    where: {
      tenantId,
      active: true,
      country: {
        equals: country,
        mode: "insensitive",
      },
    },
  });

  const zone = zones.find((z) =>
    z.states.some((s) => s.trim().toLowerCase() === state.trim().toLowerCase()),
  );

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

  console.log("RATES", rates);

  // ----------------------------------------
  // 4. Filter applicable rates
  // ----------------------------------------

  const methods = new Map<string, AvailableShippingMethod>();

  for (const rate of rates) {
    if (rate.minOrderAmount && subtotal < Number(rate.minOrderAmount)) {
      continue;
    }

    if (rate.maxOrderAmount && subtotal > Number(rate.maxOrderAmount)) {
      continue;
    }

    // Skip if we've already chosen a rate for this shipping method
    if (methods.has(rate.methodId)) {
      continue;
    }

    methods.set(rate.methodId, {
      rateId: rate.id,
      methodId: rate.methodId,
      method: rate.method.name,
      estimate:
        rate.method.estimatedMinDays && rate.method.estimatedMaxDays
          ? `${rate.method.estimatedMinDays}-${rate.method.estimatedMaxDays} Business Days`
          : rate.method.estimatedMinDays
            ? `${rate.method.estimatedMinDays} Business Day${
                rate.method.estimatedMinDays > 1 ? "s" : ""
              }`
            : null,
      amount: Number(rate.amount),
    });
  }

  return [...methods.values()];
}
