import { getTenant } from "./getTenant";

export async function withTenant<T>(
  callback: (tenantId: string) => Promise<T>,
) {
  const tenant = await getTenant();
  return callback(tenant.id);
}
