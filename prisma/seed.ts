import { prisma } from "@/utils/prisma";

async function main() {
  await prisma.tenant.create({
    data: {
      name: "Urban Threads",
      slug: "urban-threads",
      isDefault: true,
      country: "Nigeria",
    },
  });

  console.log("Default Urban Threads tenant created successfully.");
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
