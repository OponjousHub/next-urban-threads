import { getDefaultTenant } from "./getDefaultTenant";

export async function getStoreMode() {
  const tenant = await getDefaultTenant();

  return tenant?.storeMode || "SINGLE_VENDOR";
}
