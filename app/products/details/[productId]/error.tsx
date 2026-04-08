"use client";

import { useTenant } from "@/store/tenant-provider-context";
export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const { tenant } = useTenant();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <p className="text-red-600">{error.message}</p>
      <button
        onClick={reset}
        className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded"
      >
        Try again
      </button>
    </div>
  );
}
