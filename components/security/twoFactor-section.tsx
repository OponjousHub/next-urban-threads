import { useState } from "react";

export default function TwoFactorSection() {
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");

  const startSetup = async () => {
    const res = await fetch("/api/auth/2fa/setup");
    const data = await res.json();

    setQrCode(data.qrCode);
    setSecret(data.secret);
  };

  const confirm2FA = async () => {
    await fetch("/api/auth/2fa/verify", {
      method: "POST",
      body: JSON.stringify({
        secret,
        token: otp,
      }),
    });

    setEnabled(true);
  };

  return (
    <div className="border-t pt-4">
      <h3 className="font-medium">Two-Factor Authentication</h3>

      <p className="text-sm text-gray-500 mt-1">Status: Not Enabled</p>

      {/* <button className="mt-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
        Enable 2FA
      </button> */}
      {!enabled && (
        <button
          onClick={startSetup}
          className="mt-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-600"
        >
          Enable 2FA
        </button>
      )}

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
