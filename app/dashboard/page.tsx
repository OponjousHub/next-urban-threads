import { getUserDashboardStats } from "@/app/lib/dashboard";
import DashboardClient from "./dashboardClient";
import { getLoggedInUserId } from "@/lib/auth";
import { getRecoveryLoginFlag } from "@/utils/recoveryLoggedInFlag";
import { getCurrentSessionId } from "@/lib/auth";
import { authRepository } from "@/modules/auth/auth.repository";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { touchSession } from "@/lib/sessions";
import { getAuthPayload } from "@/lib/server/auth";

export default async function UserDashboard() {
  const userId = await getLoggedInUserId();
  const tenant = await getDefaultTenant();
  const currentSessionId = await getCurrentSessionId();
  const auth = await getAuthPayload();
  if (currentSessionId) {
    await touchSession(currentSessionId);
  }

  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  if (!userId) {
    throw new Error("Unauthorized");
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
