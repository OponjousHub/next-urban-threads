import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "./getDefaultTenant";

export async function createTenantUser(data: any) {
  const tenant = await getDefaultTenant();

  return prisma.user.create({
    data: {
      ...data,
      tenant: {
        connect: { id: tenant!.id },
      },
    },
  });
}
