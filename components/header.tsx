import HeaderClient from "./headerClient";
import { getOptionalAuthPayload } from "@/lib/server/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function header() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  const { role } = await getOptionalAuthPayload();

  return <HeaderClient role={role} tenantName={tenant.name} />;
}
