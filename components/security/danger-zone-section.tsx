import { toastSuccess, toastError } from "@/utils/toast-notification";
import { useRouter } from "next/navigation";
import DelSessionsModal from "../del-sessions-modal";
import { useState } from "react";

type ModalType = "logout" | "deactivate" | "deactivate-password" | null;

export default function DangerZoneSection() {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDeactivate = async () => {
    const res = await fetch("/api/account/deactivate", {
      method: "POST",
    });

    if (res.ok) {
      toastSuccess("Account deactivated");
      window.location.href = "/";
    } else {
      toastError("Failed to deactivate account");
    }
  };

  const handleLogoutEverywhere = async () => {
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
  };

  const handleDeactivateWithPassword = async () => {
    if (!password) {
      toastError("Password is required");
      return;
    }

    setLoading(true);

    const res = await fetch("/api/account/deactivate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      toastSuccess("Account deactivated");

      setTimeout(() => {
        window.location.href = "/";
      }, 800);
    } else {
      const data = await res.json();
      toastError(data.message || "Invalid password");
    }

    setLoading(false);
  };

  return (
    <div className="border-t pt-4">
      <h3 className="text-red-600 font-medium">⚠ Danger Zone</h3>

      <div className="flex gap-3 mt-2">
        <button
          onClick={() => setActiveModal("logout")}
          className="px-4 py-2 border border-red-500 text-red-600 rounded-lg"
        >
          Logout Everywhere
        </button>

        <button
          onClick={() => setActiveModal("deactivate")}
          className="px-4 py-2 bg-red-600 text-white rounded-lg"
        >
          Deactivate Account
        </button>
      </div>

      <DelSessionsModal
        isOpen={activeModal !== null}
        title={
          activeModal === "logout"
            ? "Log out everywhere?"
            : "Deactivate account?"
        }
        description={
          activeModal === "logout"
            ? "This will log you out from all devices including this one."
            : "This action will disable your account."
        }
        confirmText={
          activeModal === "logout" ? "Log out everywhere" : "Deactivate Account"
        }
        confirmColor="red"
        onCancel={() => setActiveModal(null)}
        onConfirm={
          activeModal === "logout" ? handleLogoutEverywhere : handleDeactivate
        }
      />

      {activeModal === "deactivate-password" && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold text-lg mb-2">
              Confirm your password
            </h3>

            <p className="text-sm text-gray-500 mb-4">
              For security reasons, please enter your password.
            </p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 mb-4"
              placeholder="Enter password"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={handleDeactivateWithPassword}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
