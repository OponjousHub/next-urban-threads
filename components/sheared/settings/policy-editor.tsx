"use client";

import { useEffect, useState } from "react";
import { appToast } from "@/utils/appToast";
import RichTextEditor from "@/components/ui/rich-text-editor";

type Props = {
  endpoint: string;
};

export default function PolicyEditor({ endpoint }: Props) {
  const [shipping, setShipping] = useState("");
  const [returns, setReturns] = useState("");

  const [loadingData, setLoadingData] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchPolicies() {
      try {
        const res = await fetch(endpoint);

        const data = await res.json();

        setShipping(data.shippingPolicy ?? "");
        setReturns(data.returnPolicy ?? "");
      } finally {
        setLoadingData(false);
      }
    }

    fetchPolicies();
  }, [endpoint]);

  async function save() {
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          shippingPolicy: shipping,
          returnPolicy: returns,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        appToast.error("Error", data.message);
        return;
      }

      appToast.success("Success", "Policies updated successfully.");
    } finally {
      setLoading(false);
    }
  }

  if (loadingData) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center text-gray-500">
        Loading policies...
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Shipping Policy</h2>

        <p className="mb-5 text-sm text-gray-500">
          Explain your shipping process, delivery time and conditions.
        </p>

        <RichTextEditor value={shipping} onChange={setShipping} />
      </div>

      <div className="rounded-2xl border bg-white p-6 shadow-sm">
        <h2 className="mb-2 text-lg font-semibold">Return & Refund Policy</h2>

        <p className="mb-5 text-sm text-gray-500">
          Tell customers how returns, refunds and exchanges work.
        </p>

        <RichTextEditor value={returns} onChange={setReturns} />
      </div>

      <div className="flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
          {loading ? "Saving..." : "Save Policies"}
        </button>
      </div>
    </div>
  );
}
