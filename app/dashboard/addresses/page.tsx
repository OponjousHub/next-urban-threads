import { getUserDashboardStats } from "@/app/lib/dashboard";
import { getLoggedInUserId } from "@/lib/auth";
import AddressClient from "./addressClient";
export const dynamic = "force-dynamic";
import { useTenant } from "@/store/tenant-provider-context";

export default async function GetAddresse() {
  const userId = await getLoggedInUserId();
  const { tenant } = useTenant();
  // cookies();

  if (!userId) return null;

  const dashboard = await getUserDashboardStats(userId);

  return <AddressClient initialAddresses={dashboard.addresses} />;
}
