import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodForm from "../shipping-method-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";

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
    <>
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="New Shipping Method" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-6 mt-5">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Create Shipping Method</h1>

          <p className="mt-2 text-sm text-gray-500">
            Configure a delivery method for one of your shipping zones.
          </p>
        </div>

        <ShippingMethodForm zones={zones} />
      </div>
    </>
  );
}
