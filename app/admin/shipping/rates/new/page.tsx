import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRateForm from "./shipping-rate-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default async function NewShippingRatePage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [zones, methods] = await Promise.all([
    prisma.shippingZone.findMany({
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
    }),

    prisma.shippingMethod.findMany({
      where: {
        tenantId: tenant.id,
        active: true,
      },
      orderBy: [
        {
          zone: {
            name: "asc",
          },
        },
        {
          name: "asc",
        },
      ],
      select: {
        id: true,
        name: true,
        zoneId: true,
      },
    }),
  ]);

  return (
    <>
      <AdminHeaderUI
        title="Create Shipping Rate"
        subtitle="Create a pricing rule for one of your shipping methods."
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="New Shipping Rate" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-6 mt-5">
        <ShippingRateForm zones={zones} methods={methods} />
      </div>
    </>
  );
}
