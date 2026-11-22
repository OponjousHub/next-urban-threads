import { prisma } from "@/utils/prisma";

export async function getDefaultTenant() {
  // First, look for an existing default tenant.
  const existingTenant = await prisma.tenant.findFirst({
    where: {
      isDefault: true,
    },
  });

  if (existingTenant) {
    return existingTenant;
  }

  // If none exists, create the initial tenant.
  // Upsert prevents concurrent first requests from creating duplicates.
  const tenant = await prisma.tenant.upsert({
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

  // Do not silently use an existing tenant that is not marked as default.
  if (!tenant.isDefault) {
    throw new Error(
      "The initial tenant slug 'your-store' already exists but is not marked as the default tenant.",
    );
  }

  return tenant;
}
