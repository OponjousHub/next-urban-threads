"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BankSelector from "@/components/sheared/bank-selector";

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
  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  const [form, setForm] = useState({
    bankName: bankAccount?.bankName || "",
    accountName: bankAccount?.accountName || "",
    accountNumber: bankAccount?.accountNumber || "",
  });

  //Watch the ccount number to call for verification once it is 10
  useEffect(() => {
    if (form.bankCode && form.accountNumber.length === 10) {
      verifyAccount();
    } else {
      setVerified(false);
      setVerificationError("");
    }
  }, [form.bankCode, form.accountNumber]);

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Verification function
  async function verifyAccount() {
    setVerifying(true);

    setVerified(false);

    setVerificationError("");

    try {
      const res = await fetch("/api/vendor/settings/verify-account", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          bankCode: form.bankCode,
          accountNumber: form.accountNumber,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setVerificationError(data.message);

        return;
      }

      update("accountName", data.accountName);

      setVerified(true);
    } catch {
      setVerificationError("Unable to verify account.");
    } finally {
      setVerifying(false);
    }
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
        <BankSelector
          value={form.bankName}
          onSelect={(bank) => {
            update("bankName", bank.name);

            update("bankCode", bank.code);
          }}
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
