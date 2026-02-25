"use client";

import { useState, useEffect } from "react";
import { toastSuccess, toastError } from "@/utils/toast-notification";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [useRecovery, setUseRecovery] = useState(false);
  const [showError, setShowError] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"otp" | "recovery">();

  useEffect(() => {
    if (requires2FA) {
      document.getElementById("otp")?.focus();
    }
  }, [requires2FA]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "" || password === "") {
      setShowError(true);
      return;
    }

    setShowError(false);
    setApiError(null);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Invalid email or password!");
      }

      // ⭐ IF 2FA REQUIRED
      if (data.requires2FA) {
        setRequires2FA(true);
        setTempUserId(data.userId);
        setTenantId(data.tenantId);
        return;
      }
      console.log(data.reactivated);
      if (data.reactivated) {
        toastSuccess("Your account has been restored. Welcome back!");
      }
      // ⭐ LOGIN SUCCESS WITHOUT 2FA
      window.location.href = "/dashboard";
    } catch (err: any) {
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ⭐ 2FA VERIFY HANDLER
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otpCode.trim()) {
      setApiError("Verification code is required");
      return;
    }
    if (!otpCode || !tempUserId) return;

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          userId: tempUserId,
          token: otpCode,
          tenantId,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid verification code");
      }
      window.location.href = "/dashboard";

      // router.push("/dashboard");
      // router.refresh();
    } catch (err: any) {
      console.error("LOGIN ERROR:", err);
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          {requires2FA ? "Two-Factor Verification" : "Welcome Back"}
        </h1>

        <p className="text-gray-500 text-center mb-8">
          {requires2FA
            ? !useRecovery
              ? "Enter code from your authenticator"
              : "Enter recovery code"
            : "Sign in to continue shopping"}
        </p>

        {/* ERROR */}
        {apiError && (
          <p className="bg-red-100 text-red-600 p-2 rounded-md text-center mb-4 text-sm">
            {apiError}
          </p>
        )}

        {/* ⭐ LOGIN FORM */}
        {!requires2FA && (
          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Email Address
              </label>

              <input
                type="email"
                className="w-full border rounded-lg px-3 py-2"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* PASSWORD */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full border rounded-lg px-3 py-2"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {/* ⭐ Forgot Password */}
            <div className="flex justify-end">
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-3 rounded-lg"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>
        )}

        {/* ⭐ 2FA FORM */}
        {requires2FA && (
          <form onSubmit={handleVerify2FA} className="space-y-5">
            {!useRecovery ? (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Authentication Code
                </label>

                <input
                  type="text"
                  maxLength={6}
                  placeholder="123456"
                  className="w-full border rounded-lg px-3 py-2 text-center tracking-widest"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setApiError("");
                    setMode("otp");
                  }}
                />
              </div>
            ) : (
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Recovery Code
                </label>

                <input
                  type="text"
                  maxLength={8}
                  placeholder="Enter recovery code"
                  className="w-full border rounded-lg px-3 py-2 text-center tracking-widest"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setApiError("");
                    setMode("recovery");
                  }}
                />
              </div>
            )}

            {!useRecovery ? (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg"
                  // onClick={()=>setMode("otp")}
                >
                  {loading ? "Verifying..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  className="text-sm text-indigo-600 mt-2"
                  onClick={() => setUseRecovery(true)}
                >
                  Use a recovery code instead
                </button>
              </div>
            ) : (
              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg"
                  // onClick={()=>setMode("recovery")}
                >
                  {loading ? "Verifying..." : "Verify recovery code"}
                </button>
                <button
                  type="button"
                  className="text-sm text-indigo-600 mt-2"
                  onClick={() => setUseRecovery(false)}
                >
                  Back to authenticator
                </button>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
