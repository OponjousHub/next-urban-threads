import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function getTopVendors(limit = 4) {
  const tenant = await getDefaultTenant();

  if (!tenant) return [];

  return prisma.vendor.findMany({
    where: {
      tenantId: tenant.id,
    },

    include: {
      _count: {
        select: {
          products: true,
          storeFollow: true,
        },
      },
    },

    orderBy: [
      {
        followers: {
          _count: "desc",
        },
      },
      {
        products: {
          _count: "desc",
        },
      },
      {
        createdAt: "desc",
      },
    ],

    take: limit,
  });
}
