import { prisma } from "@/utils/prisma";

const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Blue: "#2563eb",
  Red: "#dc2626",
  Green: "#16a34a",
  Beige: "#d6c1a3",
};

async function main() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const existing = await prisma.productVariant.count({
      where: { productId: product.id },
    });

    if (existing > 0) {
      console.log(`Skipping ${product.name}`);
      continue;
    }

    const sizes = product.sizes || [];
    const colors = product.colours || [];

    const variants = [];

    for (const color of colors) {
      for (const size of sizes) {
        variants.push({
          productId: product.id,
          color,
          size,
          colorHex: COLOR_MAP[color] || "#000000",
          price: Number(product.price),
          image: product.images?.[0] || "",
          stock: Math.floor(Math.random() * 15) + 1,
        });
      }
    }

    await prisma.productVariant.createMany({
      data: variants,
    });

    console.log(`✅ ${product.name} variants created`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
