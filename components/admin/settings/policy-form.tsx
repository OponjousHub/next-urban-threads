"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export default function PolicyForm({ initialData }) {
  const [shipping, setShipping] = useState(initialData.shippingPolicy || "");
  const [returns, setReturns] = useState(initialData.returnPolicy || "");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);

    await fetch("/api/admin/settings/policies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shippingPolicy: shipping,
        returnPolicy: returns,
      }),
    });

    toast.success("Policies updated ✅");
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-bold mb-2">Shipping Policy</h2>
        <textarea
          className="w-full border p-3 rounded"
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
        />
      </div>

      <div>
        <h2 className="font-bold mb-2">Return Policy</h2>
        <textarea
          className="w-full border p-3 rounded"
          value={returns}
          onChange={(e) => setReturns(e.target.value)}
        />
      </div>

      <button
        onClick={save}
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded"
      >
        {loading ? "Saving..." : "Save"}
      </button>
    </div>
  );
}
