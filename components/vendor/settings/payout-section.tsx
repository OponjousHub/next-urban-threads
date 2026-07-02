"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  bankAccount: {
    bankName: string;
    accountName: string;
    accountNumber: string;
  } | null;
};

export default function PayoutSection({ bankAccount }: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    bankName: bankAccount?.bankName || "",
    accountName: bankAccount?.accountName || "",
    accountNumber: bankAccount?.accountNumber || "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  async function save() {
    setLoading(true);

    try {
      const res = await fetch("/api/vendor/settings/bank", {
        method: "PATCH",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message);
        return;
      }

      toast.success("Bank details updated");

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">Payout Settings</h2>

      <p className="mt-1 text-sm text-gray-500">
        This account will receive your approved withdrawals.
      </p>

      <div className="mt-8 grid gap-5">
        <input
          value={form.bankName}
          onChange={(e) => update("bankName", e.target.value)}
          placeholder="Bank Name"
          className="rounded-lg border p-3"
        />

        <input
          value={form.accountName}
          onChange={(e) => update("accountName", e.target.value)}
          placeholder="Account Name"
          className="rounded-lg border p-3"
        />

        <input
          value={form.accountNumber}
          onChange={(e) => update("accountNumber", e.target.value)}
          placeholder="Account Number"
          className="rounded-lg border p-3"
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={loading}
          className="rounded-xl bg-black px-6 py-3 text-white"
        >
          {loading ? "Saving..." : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}
