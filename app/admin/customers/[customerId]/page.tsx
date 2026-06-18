import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import CustomerDetailUI from "@/components/customers/customerDetailUI";
import { serializeDecimals } from "@/lib/serialize";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const customer = await prisma.user.findFirst({
    where: {
      id: customerId,
      tenantId: tenant.id,
    },

    include: {
      orders: {
        where: {
          tenantId: tenant.id,
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

  const customerAddress = await prisma.user.findUnique({
    where: {
      id: customerId,
    },
    include: {
      addresses: true,
    },
  });

  const safeCustomer = serializeDecimals(customer);

  if (!customer) {
    notFound();
  }

  return (
    <CustomerDetailUI
      customer={safeCustomer}
      address={customerAddress?.addresses[0]}
    />
  );
}
