"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function VerifyEmailPage() {
  const params = useSearchParams();

  useEffect(() => {
    const token = params.get("token");

    if (token) {
      fetch(`/api/profile/verify-email?token=${token}`);
    }
  }, []);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />

      <h1 className="text-xl font-semibold">Verifying your email</h1>
      <p className="text-gray-500">
        Please wait while we confirm your email address...
      </p>
    </div>
  );
}
