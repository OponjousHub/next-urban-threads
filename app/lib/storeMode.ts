import { useTenant } from "@/store/tenant-provider-context";

export async function getStoreMode() {
  const { tenant } = useTenant();

  return tenant?.storeMode || "SINGLE_VENDOR";
}
