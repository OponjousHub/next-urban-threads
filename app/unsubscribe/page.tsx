"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function UnsubscribePage() {
  const params = useSearchParams();
  const email = params.get("email");

  const [status, setStatus] = useState("loading");

  useEffect(() => {
    if (!email) return;

    async function unsubscribe() {
      try {
        const res = await fetch("/api/admin/unsubscribe", {
          method: "POST",
          body: JSON.stringify({ email }),
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error();

        setStatus("success");
      } catch (err) {
        console.log(err);
        setStatus("error");
      }
    }

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      {status === "loading" && <p>Processing...</p>}
      {status === "success" && (
        <div className="text-center space-y-4">
          <p className="text-green-600 text-lg font-medium">
            ✅ You have been unsubscribed
          </p>

          <p className="text-gray-500 text-sm">
            You will no longer receive emails from us.
          </p>

          <div className="flex justify-center gap-4 mt-4">
            <a
              href="/"
              className="px-5 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition"
            >
              Go to Home
            </a>

            <a
              href="/products"
              className="px-5 py-2 border rounded-md hover:bg-gray-100 transition"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      )}
      {status === "error" && (
        <p className="text-red-500">❌ Failed to unsubscribe</p>
      )}
    </div>
  );
}
