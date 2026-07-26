import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRatesPageClient from "./shipping-rates-page-client";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";

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

  const formattedRates = rates.map((rate) => ({
    ...rate,
    amount: rate.amount.toNumber(),
    minOrderAmount: rate.minOrderAmount?.toNumber() ?? null,
    maxOrderAmount: rate.maxOrderAmount?.toNumber() ?? null,
  }));

  return (
    <>
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Shipping Rates" />{" "}
      </div>
      <ShippingRatesPageClient rates={formattedRates} />;
    </>
  );
}
