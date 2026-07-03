"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import BankSelector from "@/components/sheared/bank-selector";

type Props = {
  bankAccount: {
    bankCode: string;
    bankName: string;
    accountNumber: string;
    accountName: string;
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
    bankCode: bankAccount?.bankCode || "",
    accountNumber: bankAccount?.accountNumber || "",
    accountName: bankAccount?.accountName || "",
  });

  const lastVerified = useRef("");

  //Watch the ccount number to call for verification once it is 10
  useEffect(() => {
    if (!form.bankCode || form.accountNumber.length !== 10) {
      setVerified(false);
      setVerificationError("");
      return;
    }

    const timer = setTimeout(() => {
      verifyAccount();
    }, 700);

    return () => clearTimeout(timer);
  }, [form.bankCode, form.accountNumber]);

  function update(field: string, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  // Verification function
  async function verifyAccount() {
    // Don't verify the same account twice
    const key = `${form.bankCode}-${form.accountNumber}`;
    if (lastVerified.current === key) {
      return;
    }
    lastVerified.current = key;

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

      // ✅ Only remember successful verification
      lastVerified.current = key;

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
          value={form.accountNumber}
          onChange={(e) => update("accountNumber", e.target.value)}
          placeholder="Account Number"
          className="rounded-lg border p-3"
        />
        <div className="mt-2 text-sm">
          {verifying && (
            <span className="text-blue-600">Verifying account...</span>
          )}

          {verified && (
            <span className="font-medium text-green-600">
              ✓ Verified Account
            </span>
          )}

          {!verified && verificationError && (
            <span className="text-red-600">{verificationError}</span>
          )}
        </div>
        <input
          value={form.accountName}
          onChange={(e) => update("accountName", e.target.value)}
          placeholder="Account Name"
          className="rounded-lg border p-3"
        />
      </div>

      <div className="mt-8 flex justify-end">
        <button
          onClick={save}
          disabled={loading || verifying || !verified}
          className="rounded-xl bg-black px-6 py-3 text-white"
        >
          {loading ? "Saving..." : "Save Bank Details"}
        </button>
      </div>
    </div>
  );
}
