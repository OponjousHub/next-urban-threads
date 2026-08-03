import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRateForm from "../../new/shipping-rate-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShippingRatePage({ params }: Props) {
  const { id } = await params;

  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [rate, zones, methods] = await Promise.all([
    prisma.shippingRate.findFirst({
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

  if (!rate) {
    notFound();
  }

  return (
    <>
      <AdminHeaderUI
        title={`Edit Shipping Rate`}
        subtitle={`Update this shipping rate.`}
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Edit Shipping Rate" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <ShippingRateForm
          zones={zones}
          methods={methods}
          initialData={{
            id: rate.id,
            zoneId: rate.zoneId,
            methodId: rate.methodId,
            name: rate.name,
            description: rate.description,
            amount: rate.amount.toNumber(),
            minOrderAmount: rate.minOrderAmount?.toNumber() ?? null,
            maxOrderAmount: rate.maxOrderAmount?.toNumber() ?? null,
            minWeight: rate.minWeight,
            maxWeight: rate.maxWeight,
            priority: rate.priority,
            active: rate.active,
            isDefault: rate.isDefault,
          }}
        />
      </div>
    </>
  );
}
