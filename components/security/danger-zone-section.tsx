import { toastSuccess, toastError } from "@/utils/toast-notification";
import { useRouter } from "next/navigation";
import DelSessionsModal from "../del-sessions-modal";
import { useState } from "react";

export default function DangerZoneSection() {
  const [showLogoutAllModal, setShowLogoutAllModal] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    const res = await fetch("/api/sessions/logout-all", {
      method: "POST",
    });

    if (res.ok) {
      toastSuccess("Logged out from all devices");

      setTimeout(() => {
        router.push("/login");
      }, 800);
    } else {
      toastError("Failed to logout everywhere");
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-red-600 font-medium">⚠ Danger Zone</h3>

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => setShowLogoutAllModal(true)}
          className="px-4 py-2 border border-red-500 text-red-600 rounded-lg"
        >
          Logout Everywhere
        </button>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Deactivate Account
        </button>
      </div>

      <DelSessionsModal
        isOpen={showLogoutAllModal}
        title="Log out everywhere?"
        description="This will log you out from all devices including this one. You will need to log in again."
        confirmText="Log out everywhere"
        confirmColor="red"
        onCancel={() => setShowLogoutAllModal(false)}
        onConfirm={async () => {
          const res = await fetch("/api/sessions/logout-all", {
            method: "POST",
          });

          if (res.ok) {
            toastSuccess("Logged out from all devices");

            setTimeout(() => {
              window.location.href = "/login";
            }, 800);
          } else {
            toastError("Failed to logout everywhere");
          }
        }}
      />
    </div>
  );
}
