import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingZonesPageClient from "./shipping-zones-page-client";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function ShippingZonesPage() {
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

  const zones = await prisma.shippingZone.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      methods: {
        select: {
          id: true,
        },
      },
      rates: {
        select: {
          id: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

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
        title="Shipping Zones"
        subtitle="Organize destinations into shipping regions."
        admin={admin}
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Shipping Zones" />
      </div>
      <ShippingZonesPageClient
        zones={zones.map((zone) => ({
          ...zone,
          methodCount: zone.methods.length,
          rateCount: zone.rates.length,
        }))}
      />
    </>
  );
}
