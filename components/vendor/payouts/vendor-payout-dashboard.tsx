"use client";

import PayoutHistoryTable from "./payout-history-table";
import PayoutStatCard from "./payout-stat-card";
import RequestWithdrawalModal from "./request-withdrawal-modal";
import { PayoutStatus } from "@prisma/client";
import { useTenant } from "@/store/tenant-provider-context";
import Link from "next/link";

type Order = {
  id: string;
  paymentReference: string;
  totalAmount: number;
  commissionAmount: number;
  createdAt: string;
};

type ActiveRequest = {
  id: string;
  amount: number;
  status: PayoutStatus;
} | null;

type RejectedRequest = {
  id: string;
  amount: number;
  note: string | null;
  requestedAt: string;
} | null;

type PayoutHistoryItem = {
  id: string;
  amount: number;
  status: "PENDING" | "APPROVED" | "REJECTED" | "PAID";
  note: string | null;
  reference: string | null;
  requestedAt: string;
  approvedAt: string | null;
  paidAt: string | null;
};

type Props = {
  grossEarnings: number;
  totalCommission: number;
  netEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  availableBalance: number;
  orders: Order[];
  activeRequest: ActiveRequest;
  rejectedRequest: RejectedRequest;
  payoutHistory: PayoutHistoryItem[];
};

export default function VendorPayoutDashboard({
  grossEarnings,
  totalCommission,
  netEarnings,
  totalPaid,
  pendingBalance,
  availableBalance,
  orders,
  activeRequest,
  rejectedRequest,
  payoutHistory,
}: Props) {
  const { tenant } = useTenant();
  const hasActiveRequest = !!activeRequest;

  return (
    <div className="space-y-8">
      {/* Top Cards */}

      <div className="grid gap-6 md:grid-cols-3 xl:grid-cols-3">
        <PayoutStatCard
          title="Available Balance"
          value={availableBalance}
          color="green"
        />

        <PayoutStatCard
          title="Pending Withdrawals"
          value={pendingBalance}
          color="yellow"
        />

        <PayoutStatCard title="Total Paid" value={totalPaid} color="blue" />

        <PayoutStatCard
          title="Gross Earnings"
          value={grossEarnings}
          color="purple"
        />

        <PayoutStatCard
          title="Commission"
          value={totalCommission}
          color="red"
        />

        <PayoutStatCard
          title="Net Earnings"
          value={netEarnings}
          color="emerald"
        />
      </div>

      {/* Withdraw */}

      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Withdraw Funds</h2>

            <p className="text-sm text-gray-500">
              Request payout to your registered bank account.
            </p>
          </div>

          {rejectedRequest && !hasActiveRequest && (
            <div className="mb-6 overflow-hidden rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-white shadow-sm">
              <div className="flex items-start gap-4 p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-2xl">
                  ❌
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-700">
                    Withdrawal Request Rejected
                  </h3>

                  <p className="mt-1 text-sm text-gray-600">
                    Your withdrawal request of
                    <span className="mx-1 font-semibold">
                      {tenant.currency}
                      {rejectedRequest.amount.toLocaleString()}
                    </span>
                    was rejected by the administrator.
                  </p>

                  <div className="mt-4 rounded-xl border border-red-100 bg-white p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Reason
                    </p>

                    <p className="mt-2 text-sm leading-6 text-gray-700">
                      {rejectedRequest.note ||
                        "No reason was provided by the administrator."}
                    </p>
                  </div>

                  <div className="mt-4 flex items-center gap-2 text-sm text-green-700">
                    <span>✔</span>

                    <span>
                      Correct the issue above and submit a new withdrawal
                      request.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <RequestWithdrawalModal
            availableBalance={availableBalance}
            pendingBalance={pendingBalance}
            activeRequest={activeRequest}
          />
        </div>
      </div>

      {/*Vendor Withdrawal record*/}
      <div className="flex items-center justify-between border-b p-5">
        <div>
          <h2 className="text-lg font-semibold">Withdrawal History</h2>

          <p className="mt-1 text-sm text-gray-500">
            Your most recent withdrawal requests.
          </p>
        </div>

        <Link
          href="/vendor/payouts/history"
          className="
      inline-flex items-center gap-2
      rounded-xl
      border
      border-gray-200
      bg-white
      px-4
      py-2
      text-sm
      font-medium
      text-gray-700
      shadow-sm
      transition-all
      hover:border-[var(--color-primary)]
      hover:bg-[var(--color-primary)]
      hover:text-white
      hover:shadow-md
    "
        >
          View Full History
          <span className="text-base">→</span>
        </Link>
      </div>
      <div className="mt-8 rounded-2xl border bg-white shadow-sm">
        <div className="border-b p-5">
          <h2 className="text-lg font-semibold">Withdrawal History</h2>

          <p className="mt-1 text-sm text-gray-500">
            All withdrawal requests made from your account.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-left uppercase text-xs text-gray-500">
              <tr>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Amount</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Admin Note</th>
                <th className="px-5 py-3">Paid</th>
              </tr>
            </thead>

            <tbody>
              {payoutHistory.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-10 text-center text-gray-500"
                  >
                    No withdrawal requests yet.
                  </td>
                </tr>
              ) : (
                payoutHistory.map((payout) => (
                  <tr key={payout.id} className="border-t hover:bg-gray-50">
                    <td className="px-5 py-4">
                      {new Date(payout.requestedAt).toLocaleDateString()}
                    </td>

                    <td className="px-5 py-4 font-semibold">
                      {tenant.currency}
                      {payout.amount.toLocaleString()}
                    </td>

                    <td className="px-5 py-4">
                      {payout.status === "PENDING" && (
                        <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs text-yellow-700">
                          Pending
                        </span>
                      )}

                      {payout.status === "APPROVED" && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-700">
                          Approved
                        </span>
                      )}

                      {payout.status === "PAID" && (
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                          Paid
                        </span>
                      )}

                      {payout.status === "REJECTED" && (
                        <span className="rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
                          Rejected
                        </span>
                      )}
                    </td>

                    <td className="max-w-xs px-5 py-4 text-gray-600">
                      {payout.note ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      {payout.paidAt
                        ? new Date(payout.paidAt).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* History */}

      <PayoutHistoryTable orders={orders} />
    </div>
  );
}
