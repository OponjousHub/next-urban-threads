"use client";

import { useState } from "react";
import { appToast } from "@/utils/appToast";
import { useRouter } from "next/navigation";

type Props = {
  availableBalance: number;
  pendingBalance: number;
};

export default function RequestWithdrawalModal({
  availableBalance,
  pendingBalance,
}: Props) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [amount, setAmount] = useState("");

  const [loading, setLoading] = useState(false);

  async function requestWithdrawal() {
    const value = Number(amount);

    if (!value || value <= 0) {
      return appToast.error(
        "Invalid Amount",
        "Enter a valid withdrawal amount",
      );
    }

    if (value > availableBalance) {
      return appToast.error(
        "Insufficient Balance",
        "Withdrawal amount exceeds your available balance",
      );
    }

    try {
      setLoading(true);

      const response = await fetch("/api/vendor/payouts/request", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          amount: value,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      appToast.success(
        "Withdrawal Requested",
        "Your payout request has been submitted successfully.",
      );

      setOpen(false);

      setAmount("");

      router.refresh();
    } catch (err: any) {
      appToast.error(
        "Request Failed",
        err.message || "Unable to request payout",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        disabled={availableBalance <= 0 || pendingBalance > 0}
        onClick={() => setOpen(true)}
        className="rounded-lg bg-black px-5 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        Request Withdrawal
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Request Withdrawal</h2>

            <p className="mt-2 text-sm text-gray-500">Available Balance</p>

            <h3 className="mb-6 text-3xl font-bold text-green-600">
              ₦{availableBalance.toLocaleString()}
            </h3>

            {pendingBalance > 0 && (
              <div className="mb-5 rounded-lg border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-700">
                You already have a pending withdrawal request.
              </div>
            )}

            <label className="mb-2 block text-sm font-medium">Amount</label>

            <input
              type="number"
              min={1}
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter withdrawal amount"
              className="mb-5 w-full rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
            />

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg border px-5 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>

              <button
                disabled={loading}
                onClick={requestWithdrawal}
                className="rounded-lg bg-black px-5 py-2 text-white hover:bg-gray-800 disabled:bg-gray-400"
              >
                {loading ? "Requesting..." : "Request Withdrawal"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
