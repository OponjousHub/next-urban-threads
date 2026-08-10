import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import ShippingRatesPageClient from "./shipping-rates-page-client";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function ShippingRatesPage() {
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

  const rates = await prisma.shippingRate.findMany({
    where: {
      tenantId: tenant.id,
    },
    include: {
      zone: {
        select: {
          id: true,
          name: true,
        },
      },
      method: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: [
      {
        zone: {
          name: "asc",
        },
      },
      {
        method: {
          name: "asc",
        },
      },
      {
        priority: "asc",
      },
    ],
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

  const formattedRates = rates.map((rate) => ({
    ...rate,
    amount: rate.amount.toNumber(),
    minOrderAmount: rate.minOrderAmount?.toNumber() ?? null,
    maxOrderAmount: rate.maxOrderAmount?.toNumber() ?? null,
  }));

  return (
    <>
      <AdminHeaderUI
        title="Shipping Rates"
        subtitle="Configure shipping prices and conditions."
        admin={admin}
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="Shipping Rates" />{" "}
      </div>
      <ShippingRatesPageClient rates={formattedRates} />;
    </>
  );
}
