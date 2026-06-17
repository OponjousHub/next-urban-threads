import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import CustomerDetail from "@/components/customers/customerDetail";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const { vendor } = await getCurrentVendor();
  if (!vendor) throw new Error("Vendor not found");

  const customer = await prisma.user.findFirst({
    where: {
      id: userId,
      tenantId: tenant.id,
    },

    include: {
      orders: {
        where: {
          tenantId: tenant.id,
          vendorId: vendor.id,
        },

        include: {
          items: {
            include: {
              product: true,
            },
          },
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      reviews: {
        include: {
          product: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!customer) {
    notFound();
  }

  return <CustomerDetail customer={customer} vendorId={vendor.id} />;
}
