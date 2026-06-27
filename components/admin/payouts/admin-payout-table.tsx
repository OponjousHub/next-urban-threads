"use client";

import { useRouter } from "next/navigation";
import { useTenant } from "@/store/tenant-provider-context";
import { appToast } from "@/utils/appToast";
import { useState } from "react";

type Payout = {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "PAID" | "REJECTED";
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;

  vendor: {
    businessName: string;
    email: string;
  };
};

type Props = {
  payouts: Payout[];
};

export default function AdminPayoutTable({ payouts }: Props) {
  const router = useRouter();
  const { tenant } = useTenant();

  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function updateStatus(
    id: string,
    action: "approve" | "reject" | "paid",
  ) {
    try {
      setLoadingId(id);

      const res = await fetch(`/api/admin/payouts/${id}/${action}`, {
        method: "PATCH",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      appToast.success("Success", `Payout ${action}d successfully`);

      router.refresh();
    } catch (err: any) {
      appToast.error("Error", err.message);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr className="text-left text-sm font-semibold">
            <th className="px-6 py-4">Vendor</th>

            <th className="px-6 py-4">Amount</th>

            <th className="px-6 py-4">Requested</th>

            <th className="px-6 py-4">Status</th>

            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id} className="border-t">
              <td className="px-6 py-4">
                <div className="font-medium">{payout.vendor.businessName}</div>

                <div className="text-sm text-gray-500">
                  {payout.vendor.email}
                </div>
              </td>

              <td className="px-6 py-4 font-semibold">
                {tenant.currency}
                {payout.amount.toLocaleString()}
              </td>

              <td className="px-6 py-4">
                {new Date(payout.requestedAt).toLocaleDateString()}
              </td>

              <td className="px-6 py-4">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold
                  ${
                    payout.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-700"
                      : payout.status === "APPROVED"
                        ? "bg-blue-100 text-blue-700"
                        : payout.status === "PAID"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                  }`}
                >
                  {payout.status}
                </span>
              </td>

              <td className="px-6 py-4">
                <div className="flex gap-2">
                  {payout.status === "PENDING" && (
                    <>
                      <button
                        disabled={loadingId === payout.id}
                        onClick={() => updateStatus(payout.id, "approve")}
                        className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700"
                      >
                        Approve
                      </button>

                      <button
                        disabled={loadingId === payout.id}
                        onClick={() => updateStatus(payout.id, "reject")}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {payout.status === "APPROVED" && (
                    <button
                      disabled={loadingId === payout.id}
                      onClick={() => updateStatus(payout.id, "paid")}
                      className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700"
                    >
                      Mark Paid
                    </button>
                  )}

                  {payout.status === "PAID" && (
                    <span className="text-green-600 font-medium">
                      Completed
                    </span>
                  )}

                  {payout.status === "REJECTED" && (
                    <span className="text-red-600 font-medium">Rejected</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
