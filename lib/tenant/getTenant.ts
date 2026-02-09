import { prisma } from "@/utils/prisma";
import { headers } from "next/headers";

export async function getTenant() {
  const headersList = await headers();
  const host = headersList.get("host");

  // --- FUTURE MULTI TENANT SUPPORT ---
  // Example: store1.urbanthreads.com
  // const subdomain = host?.split(".")[0];

  // For now → return default tenant
  const tenant = await prisma.tenant.findFirst({
    where: { isDefault: true },
  });

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  return tenant;
}
