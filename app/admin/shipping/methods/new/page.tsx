import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodForm from "../shipping-method-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

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
      <AdminHeaderUI
        title="Create Shipping Method"
        subtitle="Configure a delivery method for one of your shipping zones."
      />
      <div className="space-y-6 ">
        <ShippingBreadcrumb current="New Shipping Method" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-6 mt-5">
        <ShippingMethodForm zones={zones} />
      </div>
    </>
  );
}
