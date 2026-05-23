"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!token) return;

    const verify = async () => {
      try {
        const res = await fetch(`/api/profile/verify-email?token=${token}`);

        if (!res.ok) throw new Error();

        setStatus("success");

        setTimeout(() => {
          router.push("/dashboard");
        }, 2500);
      } catch {
        setStatus("error");
      }
    };

    verify();
  }, [token, router]);

  return (
    <div className="text-center">
      {status === "loading" && (
        <>
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <h2 className="text-lg font-semibold">Verifying your email</h2>
          <p className="text-sm text-gray-500">
            Please wait while we confirm your email address.
          </p>
        </>
      )}

      {status === "success" && (
        <>
          <h2 className="text-lg font-semibold text-green-600">
            Email verified successfully 🎉
          </h2>
          <p className="text-sm text-gray-500">
            Redirecting you to dashboard...
          </p>
        </>
      )}

      {status === "error" && (
        <>
          <h2 className="text-lg font-semibold text-red-600">
            Verification failed
          </h2>
          <p className="text-sm text-gray-500">This link may have expired.</p>
        </>
      )}
    </div>
  );
}
