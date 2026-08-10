import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRateForm from "./shipping-rate-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function NewShippingRatePage() {
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

  const [zones, methods, user] = await Promise.all([
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

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Shipping Zones"
        subtitle="Organize destinations into shipping regions."
        admin={admin}
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
