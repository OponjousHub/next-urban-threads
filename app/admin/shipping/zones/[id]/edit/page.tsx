import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingZoneForm from "../../shipping-zone-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShippingZonePage({ params }: Props) {
  const { id } = await params;

  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

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

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Create Shipping Zone"
        subtitle="Shipping zones let you organize destinations for shipping methods and rates."
        admin={admin}
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Edit Shipping Zone" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <ShippingZoneForm
          initialData={{
            id: zone.id,
            name: zone.name,
            description: zone.description,
            active: zone.active,
            country: zone.country,
            states: zone.states,
          }}
        />
      </div>
    </>
  );
}
