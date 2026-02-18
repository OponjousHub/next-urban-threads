import { useState } from "react";
import toast from "react-hot-toast";

export default function TwoFactorSection({
  twoFAStatus,
}: {
  twoFAStatus: Boolean | undefined;
}) {
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");

  const startSetup = async (enable: string) => {
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
    setSecret(data.secret);
  };

  const confirm2FA = async () => {
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
        toast.error(`Failed to enable 2FA ❌. ${resData.messge}`, {
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

      setEnabled(true);
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
    }
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium">Two-Factor Authentication</h3>

      <p className="text-sm text-gray-500 mt-1">
        {enabled
          ? "Enabled"
          : `Status: ${twoFAStatus ? "Enabled" : "Not Enabled"}`}
      </p>

      {
        <button
          onClick={() => startSetup("enable")}
          className="mt-2 px-4 py-2 border hover:bg-gray-50 rounded-lg"
        >
          {enabled
            ? "Disable 2FA"
            : !twoFAStatus
              ? "Enable 2FA"
              : "Disable 2FA"}
        </button>
      }

      {qrCode && (
        <div className="mt-4 space-y-4">
          <img src={qrCode} />

          <input
            placeholder="Enter 6 digit code"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="border px-3 py-2 rounded-lg w-full"
          />

          <button
            onClick={confirm2FA}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Verify
          </button>
        </div>
      )}
    </div>
  );
}
