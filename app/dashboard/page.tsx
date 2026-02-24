import { getUserDashboardStats } from "@/app/lib/dashboard";
import DashboardClient from "./dashboardClient";
import { getLoggedInUserId } from "@/lib/auth";
import { getRecoveryLoginFlag } from "@/utils/recoveryLoggedInFlag";
import { getCurrentSessionId } from "@/lib/auth";
import { authRepository } from "@/modules/auth/auth.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { touchSession } from "@/lib/sessions";

export default async function UserDashboard() {
  const userId = await getLoggedInUserId();
  const tenant = await getDefaultTenant();
  const currentSessionId = await getCurrentSessionId();

  if (currentSessionId) {
    await touchSession(currentSessionId);
  }

  if (!userId) {
    throw new Error("Unauthorized");
  }
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const sessions = await authRepository.getUserSessions(userId, tenant.id);

  const recoveryNotice = await getRecoveryLoginFlag();

  const stats = await getUserDashboardStats(userId);

  return (
    <DashboardClient
      stats={stats}
      recoveryNotice={recoveryNotice}
      sessions={sessions}
      currentSessionId={currentSessionId}
    />
  );
}
