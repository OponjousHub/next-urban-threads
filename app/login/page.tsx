"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { appToast } from "@/utils/appToast";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  const [requires2FA, setRequires2FA] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  const [useRecovery, setUseRecovery] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [mode, setMode] = useState<"otp" | "recovery">("otp");

  useEffect(() => {
    if (requires2FA) {
      document.getElementById("otp")?.focus();
    }
  }, [requires2FA]);

  /*
   * ---------------------------------------------------------
   * LOGIN
   * ---------------------------------------------------------
   */
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setApiError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setApiError("Please enter your email address and password.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Invalid email or password.");
      }

      /*
       * -------------------------------------------------------
       * 2FA REQUIRED
       * -------------------------------------------------------
       */
      if (data.requires2FA) {
        setRequires2FA(true);
        setTempUserId(data.userId);
        setTenantId(data.tenantId);
        setMode("otp");
        setOtpCode("");
        setLoading(false);

        return;
      }

      /*
       * -------------------------------------------------------
       * LOGIN SUCCESS
       * -------------------------------------------------------
       */

      if (data.reactivated) {
        appToast.success(
          "Success",
          "Your account has been restored. Welcome back!",
        );
      }

      setSuccessMessage("Login successful. Taking you to your dashboard...");

      router.replace("/dashboard");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to log in. Please try again.";

      setApiError(message);
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * 2FA VERIFICATION
   * ---------------------------------------------------------
   */
  const handleVerify2FA = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setApiError(null);
    setSuccessMessage(null);

    if (!otpCode.trim()) {
      setApiError(
        useRecovery
          ? "Please enter your recovery code."
          : "Please enter your authentication code.",
      );
      return;
    }

    if (!tempUserId || !tenantId) {
      setApiError(
        "Your verification session has expired. Please log in again.",
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: tempUserId,
          token: otpCode.trim(),
          tenantId,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Invalid verification code.");
      }

      if (data.reactivated) {
        appToast.success(
          "Success",
          "Your account has been restored. Welcome back!",
        );
      }

      setSuccessMessage(
        "Verification successful. Taking you to your dashboard...",
      );

      router.replace("/dashboard");
    } catch (err: unknown) {
      console.error("LOGIN ERROR:", err);

      const message =
        err instanceof Error
          ? err.message
          : "Verification failed. Please try again.";

      setApiError(message);
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * UI
   * ---------------------------------------------------------
   */
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gray-50 px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        {/* Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary)]/10">
              <svg
                className="h-6 w-6 text-[var(--color-primary)]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m10 17 5-5-5-5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 12H3"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              {requires2FA ? "Two-Factor Verification" : "Welcome Back"}
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              {requires2FA
                ? !useRecovery
                  ? "Enter the code from your authenticator app."
                  : "Enter one of your recovery codes."
                : "Sign in to continue shopping."}
            </p>
          </div>

          {/* Error */}
          {apiError && (
            <div
              role="alert"
              className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              <div className="flex items-start gap-3">
                <svg
                  className="mt-0.5 h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
                </svg>

                <span>{apiError}</span>
              </div>
            </div>
          )}

          {/* Success */}
          {successMessage && (
            <div
              role="status"
              className="mb-5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700"
            >
              <div className="flex items-center gap-3">
                <svg
                  className="h-5 w-5 shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m8 12 2.5 2.5L16 9"
                  />
                </svg>

                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* =====================================================
              LOGIN FORM
          ===================================================== */}
          {!requires2FA && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  disabled={loading}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setApiError(null);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Password
                </label>

                <input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={loading}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setApiError(null);
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Forgot password */}
              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-[var(--color-primary)] transition hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Login button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                      />
                    </svg>

                    <span>Signing you in...</span>
                  </>
                ) : (
                  "Log In"
                )}
              </button>
            </form>
          )}

          {/* =====================================================
              2FA FORM
          ===================================================== */}
          {requires2FA && (
            <form onSubmit={handleVerify2FA} className="space-y-5">
              {/* Authentication / Recovery code */}
              <div>
                <label
                  htmlFor="otp"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  {useRecovery ? "Recovery Code" : "Authentication Code"}
                </label>

                <input
                  id="otp"
                  type="text"
                  inputMode={useRecovery ? "text" : "numeric"}
                  autoComplete="one-time-code"
                  maxLength={useRecovery ? 8 : 6}
                  placeholder={useRecovery ? "Enter recovery code" : "123456"}
                  value={otpCode}
                  disabled={loading}
                  onChange={(e) => {
                    setOtpCode(e.target.value);
                    setApiError(null);
                    setMode(useRecovery ? "recovery" : "otp");
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-center text-lg tracking-[0.3em] text-gray-900 outline-none transition placeholder:text-gray-400 placeholder:tracking-normal focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10 disabled:cursor-not-allowed disabled:bg-gray-50"
                />
              </div>

              {/* Verify button */}
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 0 1 8-8v4a4 4 0 0 0-4 4H4Z"
                      />
                    </svg>

                    <span>Verifying...</span>
                  </>
                ) : useRecovery ? (
                  "Verify Recovery Code"
                ) : (
                  "Verify Code"
                )}
              </button>

              {/* Switch verification method */}
              <div className="text-center">
                {!useRecovery ? (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setUseRecovery(true);
                      setMode("recovery");
                      setOtpCode("");
                      setApiError(null);
                    }}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Use a recovery code instead
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                      setUseRecovery(false);
                      setMode("otp");
                      setOtpCode("");
                      setApiError(null);
                    }}
                    className="text-sm font-medium text-[var(--color-primary)] hover:underline disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back to authenticator
                  </button>
                )}
              </div>
            </form>
          )}
        </div>

        {/* Small footer */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Secure sign-in to your account
        </p>
      </div>
    </div>
  );
}
