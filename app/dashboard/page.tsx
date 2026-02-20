import { getUserDashboardStats } from "@/app/lib/dashboard";
import DashboardClient from "./dashboardClient";
import { getLoggedInUserId } from "@/lib/auth";
import { getRecoveryLoginFlag } from "@/utils/recoveryLoggedInFlag";

export default async function UserDashboard() {
  const userId = await getLoggedInUserId();
  // const recoveryLogin = await getRecoveryLoginFlag();
  const recoveryNotice = await getRecoveryLoginFlag();
  if (!userId) {
    return null; // or redirect
  }

  const stats = await getUserDashboardStats(userId);

  return <DashboardClient stats={stats} recoveryNotice={recoveryNotice} />;
}
