import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingMethodForm from "../../shipping-method-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditShippingMethodPage({ params }: Props) {
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

  const [method, zones, user] = await Promise.all([
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

    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),
  ]);

  if (!method) {
    notFound();
  }

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Create Shipping Method"
        subtitle="Configure a delivery method for one of your shipping zones."
        admin={admin}
      />
      <div className="space-y-6">
        <ShippingBreadcrumb current="New Shipping Method" />
      </div>
      <div className="mx-auto w-full max-w-5xl">
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
