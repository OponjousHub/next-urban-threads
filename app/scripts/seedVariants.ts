import { prisma } from "@/utils/prisma";

async function main() {
  const product = await prisma.product.findFirst();

  if (!product) {
    console.log("No product found");
    return;
  }

  await prisma.productVariant.createMany({
    data: [
      {
        productId: product.id,
        color: "Black",
        size: "42",
        price: 140,
        image: product.images[0],
        stock: 10,
      },
      {
        productId: product.id,
        color: "Beige",
        size: "41",
        price: 123,
        image: product.images[0],
        stock: 5,
      },
    ],
  });

  console.log("Variants created!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
