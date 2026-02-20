import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Disable2FAModal from "../delete-2FA-modal";
import RecoveryCodesModal from "../RecoveryCodesModal";

export default function TwoFactorSection({
  twoFAStatus,
}: {
  twoFAStatus: boolean | undefined;
}) {
  // const [showDisableModal, setShowDisableModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [mode, setMode] = useState<"enable" | "disable" | null>(null);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState(twoFAStatus);
  const [loading, setLoading] = useState(false);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);

  useEffect(() => {
    setStatus(twoFAStatus);
  }, [twoFAStatus]);

  const startSetup = async () => {
    const res = await fetch("/api/auth/2FA/setup");

    if (!res.ok) {
      console.error("Setup failed:", await res.text());
      toast.error("2FA Setup failed", {
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

    const data = await res.json();
    setQrCode(data.qrCode);
    // setSecret(data.secret);
  };

  const confirm2FA = async () => {
    setLoading(true);
    if (otp.trim() === "") {
      toast.error(`Please enter the otp`, {
        duration: 6000, // 6 seconds
      });
      return;
    }

    try {
      const response = await fetch("/api/auth/2FA/verify", {
        method: "POST",
        body: JSON.stringify({
          token: otp,
        }),
      });
      if (!response.ok) {
        const resData = await response.json();
        toast.error(`Failed to enable 2FA ❌. ${resData.message}`, {
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
      const resData = await response.json();

      // setEnabled(true);
      setQrCode(null);
      toast.success(`2FA enabled successfully.`, {
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
      setStatus(true);
      setRecoveryCodes(resData.recoveryCodes);
      setShowRecoveryModal(true);
    } catch (err) {
      console.error(err);
      toast.error(`Internal server error!. ${{ status: 500 }}`, {
        duration: 6000, // 5 seconds
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
    } finally {
      setLoading(false);
    }
  };

  // const disable2FA = async () => {
  //   if (!otp.trim()) {
  //     return toast.error("Enter OTP", {
  //       duration: 6000, // 6 seconds
  //       style: {
  //         border: "1px solid #4f46e5",
  //         padding: "12px",
  //         color: "#333",
  //       },
  //       iconTheme: {
  //         primary: "#4f46e5",
  //         secondary: "#fff",
  //       },
  //     });
  //   }

  //   const res = await fetch("/api/auth/2FA/disable", {
  //     method: "POST",
  //     body: JSON.stringify({ token: otp }),
  //   });

  //   if (!res.ok) {
  //     const data = await res.json();
  //     toast.error(data.message, {
  //       duration: 6000, // 6 seconds
  //       style: {
  //         border: "1px solid #4f46e5",
  //         padding: "12px",
  //         color: "#333",
  //       },
  //       iconTheme: {
  //         primary: "#4f46e5",
  //         secondary: "#fff",
  //       },
  //     });
  //     return;
  //   }

  //   toast.success("2FA Disabled");
  //   window.location.reload();
  // };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium">Two-Factor Authentication</h3>
      <p className="text-sm text-gray-500 mt-1">
        {`Status: ${status ? "Enabled" : "Not Enabled"}`}
      </p>
      <button
        className="mt-2 px-4 py-2 border hover:bg-gray-50 rounded-lg"
        onClick={() => {
          if (status) {
            setMode("disable");
          } else {
            startSetup();
            setMode("enable");
          }
        }}
      >
        {status ? "Disable 2FA" : "Enable 2FA"}
      </button>
      {mode === "enable" && qrCode && (
        <div className="mt-4 space-y-4">
          <img src={qrCode} />
          <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            If you previously enabled 2FA, please remove the old UrbanThreads
            entry from your authenticator app before scanning.
          </p>

          <input
            placeholder="Enter 6 digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full"
          />

          <button
            onClick={confirm2FA}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
          <button
            onClick={() => setMode(null)}
            className="px-4 py-2 ml-6 border rounded-lg"
          >
            Cancel
          </button>
        </div>
      )}
      <Disable2FAModal
        open={mode === "disable"}
        onClose={() => setMode(null)}
        onSetStatus={() => setStatus(false)}
      />
      <RecoveryCodesModal
        open={showRecoveryModal}
        onClose={() => setShowRecoveryModal(false)}
        codes={recoveryCodes}
      />
    </div>
  );
}
