import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodForm from "../shipping-method-form";

export default async function NewShippingMethodPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const zones = await prisma.shippingZone.findMany({
    where: {
      tenantId: tenant.id,
      active: true,
    },
    orderBy: {
      name: "asc",
    },
    select: {
      id: true,
      name: true,
    },
  });

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Shipping Method</h1>

        <p className="mt-2 text-sm text-gray-500">
          Configure a delivery method for one of your shipping zones.
        </p>
      </div>

      <ShippingMethodForm zones={zones} />
    </div>
  );
}
