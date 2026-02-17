import PasswordSection from "@/components/security/password-section";
import TwoFactorSection from "@/components/security/twoFactor-section";
import ActiveSessionsSection from "@/components/security/active-session-section";
import DangerZoneSection from "@/components/security/danger-zone-section";
// import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export default function SecurityCard() {
  // const tenant = await getDefaultTenant();
  // const userId = await getLoggedInUserId();

  // if (!userId) {
  //   throw new Error("Unauthorized");
  // }
  // if (!tenant) {
  //   throw new Error("Default tenant not found");
  // }

  // const user = await prisma.user.findUnique({
  //   where: { id: userId, tenantId: tenant.id },
  // });
  // console.log(user?.passwordUpdatedAt);
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

      <PasswordSection
      // passwordUpdated={user?.passwordUpdatedAt}
      />
      <TwoFactorSection />
      <ActiveSessionsSection />
      <DangerZoneSection />
    </div>
  );
}
