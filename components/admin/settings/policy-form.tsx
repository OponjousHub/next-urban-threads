"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";

export default function PolicyForm() {
  const [shipping, setShipping] = useState("");
  const [returns, setReturns] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/admin/settings/policies");
      const data = await res.json();

      setShipping(data.shippingPolicy || "");
      setReturns(data.returnPolicy || "");
    };

    fetchData();
  }, []);

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
        <RichTextEditor value={shipping} onChange={setShipping} />
        {/* <textarea
          className="w-full border p-3 rounded min-h-64"
          value={shipping}
          onChange={(e) => setShipping(e.target.value)}
        /> */}
      </div>

      <div>
        <h2 className="font-bold mb-2">Return Policy</h2>
        <RichTextEditor value={returns} onChange={setReturns} />
        {/* <textarea
          className="w-full border p-3 rounded min-h-64"
          value={returns}
          onChange={(e) => setReturns(e.target.value)}
        /> */}
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
