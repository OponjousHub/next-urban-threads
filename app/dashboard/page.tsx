import { getUserDashboardStats } from "@/app/lib/dashboard";
import DashboardClient from "./dashboardClient";
import { getLoggedInUserId } from "@/lib/auth";
import { useTenant } from "@/store/tenant-provider-context";

export default async function UserDashboard() {
  const userId = await getLoggedInUserId();
  const { tenant } = useTenant();

  if (!userId) {
    return null; // or redirect
  }

  const stats = await getUserDashboardStats(userId);

  return <DashboardClient stats={stats} />;
}
