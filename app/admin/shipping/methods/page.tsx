import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodsPageClient from "./shipping-methods-page-client";

export default async function ShippingMethodsPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const methods = await prisma.shippingMethod.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      zone: {
        select: {
          id: true,
          name: true,
        },
      },
      rates: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <ShippingMethodsPageClient
      methods={methods.map((method) => ({
        id: method.id,
        name: method.name,
        description: method.description,
        active: method.active,
        estimatedMinDays: method.estimatedMinDays,
        estimatedMaxDays: method.estimatedMaxDays,
        createdAt: method.createdAt,
        zone: method.zone,
        rateCount: method.rates.length,
      }))}
    />
  );
}
