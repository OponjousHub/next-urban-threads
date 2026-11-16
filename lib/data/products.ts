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
          stock: true,
        },
      },
    },
  });

  return products
    .map((product) => {
      const effectiveStock =
        product.variants.length > 0
          ? product.variants.reduce(
              (total, variant) => total + variant.stock,
              0,
            )
          : product.stock;

      return {
        id: product.id,
        name: product.name,
        stock: effectiveStock,
      };
    })
    .filter((product) => product.stock < 5)
    .slice(0, 5);
}
