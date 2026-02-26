"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { toastSuccess } from "@/utils/toast-notification";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600">Invalid reset link.</p>
      </div>
    );
  }

  /* -----------------------------
     Password Strength Logic
  ------------------------------*/

  const getStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strength = getStrength(password);

  const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"];

  const strengthColor = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-blue-500",
    "bg-green-500",
  ];

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  /* -----------------------------
     Submit Handler
  ------------------------------*/

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirm) {
      setError("All fields are required");
      triggerShake();
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      triggerShake();
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: password,
        }),
      });

      if (res.ok) {
        toastSuccess("Password reset successful");

        setTimeout(() => {
          router.push("/login");
        }, 1200);
      } else {
        const data = await res.json();
        setError(data.error || "Reset failed");
        triggerShake();
      }
    } catch {
      setError("Network error. Please try again.");
      triggerShake();
    }

    setLoading(false);
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (error) setError(null);
  };

  const handleConfirmChange = (value: string) => {
    setConfirm(value);
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div
        className={`w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition ${
          shake ? "animate-shake" : ""
        }`}
      >
        <h1 className="text-2xl font-semibold text-center mb-2">
          Reset Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your new password.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Password */}
          <input
            type="password"
            placeholder="New password"
            className={`w-full border rounded-lg px-4 py-2 mb-2 outline-none transition
              ${error ? "border-red-500" : "focus:border-black"}`}
            value={password}
            onChange={(e) => handlePasswordChange(e.target.value)}
          />

          {/* Strength Meter */}
          {password && (
            <div className="mb-4">
              <div className="h-2 w-full bg-gray-200 rounded">
                <div
                  className={`h-2 rounded transition-all ${
                    strengthColor[strength]
                  }`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              <p className="text-xs mt-1 text-gray-500">
                Strength: {strengthLabel[strength]}
              </p>
            </div>
          )}

          {/* Confirm */}
          <input
            type="password"
            placeholder="Confirm password"
            className={`w-full border rounded-lg px-4 py-2 mb-4 outline-none transition
              ${error ? "border-red-500" : "focus:border-black"}`}
            value={confirm}
            onChange={(e) => handleConfirmChange(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>
      </div>

      {/* Shake Animation */}
      <style jsx>{`
        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-6px);
          }
          40% {
            transform: translateX(6px);
          }
          60% {
            transform: translateX(-4px);
          }
          80% {
            transform: translateX(4px);
          }
          100% {
            transform: translateX(0);
          }
        }

        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}
