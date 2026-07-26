import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingZoneForm from "../../shipping-zone-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShippingZonePage({ params }: Props) {
  const { id } = await params;

  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const zone = await prisma.shippingZone.findFirst({
    where: {
      id,
      tenantId: tenant.id,
    },
  });

  if (!zone) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Edit Shipping Zone" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        {" "}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Shipping Zone</h1>

          <p className="mt-2 text-sm text-gray-500">
            Update this shipping zone's information.
          </p>
        </div>
        <ShippingZoneForm
          initialData={{
            id: zone.id,
            name: zone.name,
            description: zone.description,
            active: zone.active,
          }}
        />
      </div>
    </>
  );
}
