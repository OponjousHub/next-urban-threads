import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodForm from "../../shipping-method-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShippingMethodPage({ params }: Props) {
  const { id } = await params;

  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [method, zones] = await Promise.all([
    prisma.shippingMethod.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    }),

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
  ]);

  if (!method) {
    notFound();
  }

  return (
    <>
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="New Shipping Method" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        {" "}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Shipping Method</h1>

          <p className="mt-2 text-sm text-gray-500">
            Update this shipping method.
          </p>
        </div>
        <ShippingMethodForm
          zones={zones}
          initialData={{
            id: method.id,
            zoneId: method.zoneId,
            name: method.name,
            description: method.description,
            estimatedMinDays: method.estimatedMinDays,
            estimatedMaxDays: method.estimatedMaxDays,
            active: method.active,
          }}
        />
      </div>
    </>
  );
}
