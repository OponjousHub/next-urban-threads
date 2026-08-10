import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import CustomerDetailUI from "@/components/customers/customerDetailUI";
import { serializeDecimals } from "@/lib/serialize";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { redirect } from "next/navigation";
import { getAuthPayload } from "@/lib/server/auth";

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const [customer, customerAddress, user] = await Promise.all([
    prisma.user.findFirst({
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
    }),

    prisma.user.findUnique({
      where: {
        id: customerId,
      },
      include: {
        addresses: true,
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

  const safeCustomer = serializeDecimals(customer);

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  if (!customer) {
    notFound();
  }

  return (
    <>
      <AdminHeaderUI
        title="Customers"
        subtitle="View customer details"
        admin={admin}
      />

      <CustomerDetailUI
        customer={safeCustomer}
        address={customerAddress?.addresses[0]}
      />
    </>
  );
}
