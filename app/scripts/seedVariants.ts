import { prisma } from "@/utils/prisma";

async function main() {
  const products = await prisma.product.findMany();

  for (const product of products) {
    const sizes: string[] = product.sizes || [];
    const colors: string[] = product.colours || [];

    // Skip if already has variants
    const existing = await prisma.productVariant.count({
      where: { productId: product.id },
    });

    if (existing > 0) {
      console.log(`Skipping ${product.name} (already has variants)`);
      continue;
    }

    const variants = [];

    for (const color of colors) {
      for (const size of sizes) {
        variants.push({
          productId: product.id,
          color,
          size,
          price: Number(product.price),
          image: product.images?.[0] || "",
          stock: 10,
        });
      }
    }

    if (variants.length > 0) {
      await prisma.productVariant.createMany({ data: variants });
      console.log(`✅ Created variants for ${product.name}`);
    } else {
      console.log(`⚠️ No sizes/colors for ${product.name}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
