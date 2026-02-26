"use client";

import { useState } from "react";
import Link from "next/link";
import { toastSuccess } from "@/utils/toast-notification";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 400);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      triggerShake();
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      triggerShake();
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        toastSuccess(
          "If an account exists for this email, a reset link has been sent.",
        );
        setEmail(""); // optional reset
      } else {
        setError("Something went wrong. Please try again.");
        triggerShake();
      }
    } catch {
      setError("Network error. Please try again.");
      triggerShake();
    }

    setLoading(false);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (error && isValidEmail(value)) {
      setError(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div
        className={`w-full max-w-md bg-white shadow-xl rounded-2xl p-8 transition ${
          shake ? "animate-shake" : ""
        }`}
      >
        <h1 className="text-2xl font-semibold text-center mb-2">
          Forgot Password
        </h1>

        <p className="text-sm text-gray-500 text-center mb-6">
          Enter your email and we’ll send you a reset link.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className={`w-full border rounded-lg px-4 py-2 mb-4 outline-none transition
              ${error ? "border-red-500" : "focus:border-black"}`}
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition flex items-center justify-center"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              "Send Reset Link"
            )}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <Link href="/login" className="text-gray-600 hover:underline">
            Back to Login
          </Link>
        </div>
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
