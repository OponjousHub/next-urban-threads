"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function StoreModeToggle({
  initialMode,
}: {
  initialMode: "SINGLE" | "MULTI";
}) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  // Sync state whenever prop changes
  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  async function updateMode(newMode: "SINGLE" | "MULTI") {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/store-mode", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: newMode,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      setMode(newMode);

      toast.success(`Store switched to ${newMode}`);

      // refresh server components/homepage
      window.location.reload();
    } catch {
      toast.error("Failed to update store mode");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border p-6 shadow-sm">
      <h2 className="font-semibold text-lg mb-2">Store Mode</h2>

      <p className="text-sm text-gray-500 mb-6">
        Switch between single vendor and marketplace mode
      </p>

      <div className="flex gap-4">
        <button
          disabled={loading}
          onClick={() => updateMode("SINGLE")}
          className={`flex-1 py-3 rounded-full font-medium transition ${
            mode === "SINGLE" ? "bg-black text-white" : "bg-white"
          }`}
        >
          🏬 Single Vendor
        </button>

        <button
          disabled={loading}
          onClick={() => updateMode("MULTI")}
          className={`flex-1 py-3 rounded-full font-medium transition ${
            mode === "MULTI" ? "bg-black text-white" : "bg-white"
          }`}
        >
          🛍 Multi Vendor
        </button>
      </div>
    </div>
  );
}
