import { prisma } from "@/utils/prisma";

export async function getLowStockProducts(tenantId: string) {
  const products = await prisma.product.findMany({
    where: {
      tenantId,
      OR: [
        {
          stock: { lt: 5 },
          variants: { none: {} },
        },
        {
          variants: { some: {} },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      stock: true,
      variants: {
        select: {
          id: true,
          color: true,
          size: true,
          stock: true,
        },
      },
    },
  });

  const lowStockItems = products.flatMap((product) => {
    // Simple product
    if (product.variants.length === 0) {
      return product.stock < 5
        ? [
            {
              id: product.id,
              name: product.name,
              stock: product.stock,
            },
          ]
        : [];
    }

    // Variant product: check each variant independently
    return product.variants
      .filter((variant) => variant.stock < 5)
      .map((variant) => {
        const details = [variant.color, variant.size]
          .filter(Boolean)
          .join(" / ");

        return {
          id: variant.id,
          name: details ? `${product.name} — ${details}` : product.name,
          stock: variant.stock,
        };
      });
  });

  return lowStockItems.slice(0, 5);
}
