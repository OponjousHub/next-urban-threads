import { getUserDashboardStats } from "@/app/lib/dashboard";
import { getLoggedInUserId } from "@/lib/auth";
import AddressClient from "./addressClient";

export default async function GetAddresse() {
  const userId = await getLoggedInUserId();

  if (!userId) return null;

  const dashboard = await getUserDashboardStats(userId);
  console.log("Userrrrr iiiiid", userId);

  return <AddressClient addresses={dashboard.addresses} />;
}
