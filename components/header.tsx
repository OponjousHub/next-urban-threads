import HeaderClient from "./headerClient";
import { getOptionalAuthPayload } from "@/lib/server/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export default async function Header() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const { role } = await getOptionalAuthPayload();

  const categories = await prisma.category.findMany({
    where: {
      tenantId: tenant.id,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <HeaderClient
      role={role}
      tenantName={tenant.name}
      categories={categories}
      storeMode={tenant.storeMode}
    />
  );
}
