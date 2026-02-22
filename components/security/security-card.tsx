import PasswordSection from "@/components/security/password-section";
import TwoFactorSection from "@/components/security/twoFactor-section";
import ActiveSessionsSection from "@/components/security/active-session-section";
import DangerZoneSection from "@/components/security/danger-zone-section";
import type { DashboardStats } from "@/types/dashboard";

export default function SecurityCard({
  userData,
  sessions,
  currentSessionId,
}: {
  userData: DashboardStats;
  sessions: any[];
  currentSessionId: string | null;
}) {
  return (
    <div className="bg-white shadow rounded-2xl p-6 space-y-6">
      <div>
        <h2 className="text-xl font-semibold flex items-center gap-2">
          🔒 Security
        </h2>
        <p className="text-sm text-gray-500">
          Protect and manage your account security
        </p>
      </div>

      <PasswordSection passwordUpdated={userData.user?.passwordUpdatedAt} />
      <TwoFactorSection twoFAStatus={userData.user?.twoFactorEnabled} />
      <ActiveSessionsSection
        sessions={sessions}
        currentSessionId={currentSessionId}
      />
      <DangerZoneSection />
    </div>
  );
}
