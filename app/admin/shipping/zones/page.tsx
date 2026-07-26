import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingZonesPageClient from "./shipping-zones-page-client";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";

export default async function ShippingZonesPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const zones = await prisma.shippingZone.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      methods: {
        select: {
          id: true,
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
    <>
      <div className="space-y-6">
        <ShippingBreadcrumb current="Shipping Zones" />
      </div>
      <ShippingZonesPageClient
        zones={zones.map((zone) => ({
          ...zone,
          methodCount: zone.methods.length,
          rateCount: zone.rates.length,
        }))}
      />
    </>
  );
}
