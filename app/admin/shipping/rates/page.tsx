import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRatesPageClient from "./shipping-rates-page-client";

export default async function ShippingRatesPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const rates = await prisma.shippingRate.findMany({
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
      method: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        zone: {
          name: "asc",
        },
      },
      {
        method: {
          name: "asc",
        },
      },
      {
        priority: "asc",
      },
    ],
  });

  return <ShippingRatesPageClient rates={rates} />;
}
