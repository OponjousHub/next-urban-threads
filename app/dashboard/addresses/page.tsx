import { getUserDashboardStats } from "@/app/lib/dashboard";
import { getLoggedInUserId } from "@/lib/auth";
import AddressClient from "./addressClient";
export const dynamic = "force-dynamic";
// import { cookies } from "next/headers";

export default async function GetAddresse() {
  const userId = await getLoggedInUserId();
  // cookies();

  if (!userId) return null;

  const dashboard = await getUserDashboardStats(userId);

  return <AddressClient initialAddresses={dashboard.addresses} />;
}
