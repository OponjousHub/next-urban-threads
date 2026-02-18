import toast from "react-hot-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// import { AdminToast } from "@/components/ui/adminToast";
// import { useTenant } from "@/store/tenant-provider-context";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function Disable2FAModal({ open, onClose }: Props) {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState<string | null>(null);

  const disable2FA = async () => {
    if (!otp.trim()) {
      setError("Enter OTP");
      return;
    }

    try {
      const res = await fetch("/api/auth/2FA/disable", {
        method: "POST",
        body: JSON.stringify({ token: otp }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message, {
          duration: 6000, // 6 seconds
          style: {
            border: "1px solid #4f46e5",
            padding: "12px",
            color: "#333",
          },
          iconTheme: {
            primary: "#4f46e5",
            secondary: "#fff",
          },
        });
        return;
      }

      toast.success("2FA Disabled", {
        duration: 6000, // 6 seconds
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });

      onClose();
      setOtp("");

      window.location.reload();
    } catch (err: any) {
      console.error(err.message);
      toast.error("Server error", {
        duration: 6000, // 6 seconds
        style: {
          border: "1px solid #4f46e5",
          padding: "12px",
          color: "#333",
        },
        iconTheme: {
          primary: "#4f46e5",
          secondary: "#fff",
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-[400px] space-y-4">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Disable Two-Factor Authentication
              </DialogTitle>
            </DialogHeader>

            {error && (
              <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
                {error}
              </p>
            )}

            <p className="text-sm text-gray-500">
              Are you sure you want to disable 2FA? This will make your account
              less secure.
            </p>

            <input
              placeholder="Enter 6 digit OTP"
              value={otp}
              onChange={(e) => {
                setOtp(e.target.value);
                setError("");
              }}
              className="border px-3 py-2 rounded-lg w-full"
            />

            <div className="flex justify-end gap-2">
              <button
                onClick={() => onClose()}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>

              <button
                onClick={disable2FA}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Confirm Disable
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
