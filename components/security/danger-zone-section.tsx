import { toastSuccess, toastError } from "@/utils/toast-notification";
import { useRouter } from "next/navigation";

export default function DangerZoneSection() {
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
          onClick={handleLogout}
          className="px-4 py-2 border border-red-500 text-red-600 rounded-lg"
        >
          Logout Everywhere
        </button>

        <button className="px-4 py-2 bg-red-600 text-white rounded-lg">
          Deactivate Account
        </button>
      </div>
    </div>
  );
}
