"use client";

import { useState } from "react";

export default function StoreModeToggle({
  initialMode,
}: {
  initialMode: "SINGLE" | "MULTI";
}) {
  const [mode, setMode] = useState(initialMode);

  async function handleChange(newMode: "SINGLE" | "MULTI") {
    setMode(newMode);

    await fetch("/api/admin/store-mode", {
      method: "PATCH",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        storeMode: newMode,
      }),
    });
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border">
      <h3 className="font-semibold text-lg mb-5">Store Type</h3>

      <div className="bg-gray-100 rounded-full p-1 flex">
        <button
          onClick={() => handleChange("SINGLE")}
          className={`flex-1 py-3 rounded-full font-medium transition
${mode === "SINGLE" ? "bg-black text-white shadow" : "text-gray-500"}
`}
        >
          🏬 Single Vendor
        </button>

        <button
          onClick={() => handleChange("MULTI")}
          className={`flex-1 py-3 rounded-full font-medium transition
${mode === "MULTI" ? "bg-black text-white shadow" : "text-gray-500"}
`}
        >
          🛍 Multi Vendor
        </button>
      </div>

      <p className="text-sm text-gray-500 mt-4">
        Single = one store Multi = marketplace with vendors
      </p>
    </div>
  );
}
