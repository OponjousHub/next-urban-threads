import { prisma } from "@/utils/prisma";

async function main() {
  await prisma.tenant.upsert({
    where: {
      slug: "your-store",
    },
    update: {},
    create: {
      slug: "your-store",
      isDefault: true,
      country: "NG",
    },
  });

  console.log("Default tenant created or already exists.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("Seed failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
