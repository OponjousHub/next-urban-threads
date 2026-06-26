"use client";

import PayoutHistoryTable from "./payout-history-table";
import PayoutStatCard from "./payout-stat-card";

type Order = {
  id: string;
  paymentReference: string;
  totalAmount: number;
  commissionAmount: number;
  createdAt: string;
};

type Props = {
  grossEarnings: number;
  totalCommission: number;
  netEarnings: number;
  totalPaid: number;
  pendingBalance: number;
  availableBalance: number;
  orders: Order[];
};

export default function VendorPayoutDashboard({
  grossEarnings,
  totalCommission,
  netEarnings,
  totalPaid,
  pendingBalance,
  availableBalance,
  orders,
}: Props) {
  return (
    <div className="space-y-8">
      {/* Top Cards */}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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

          <button
            disabled={availableBalance <= 0}
            className="rounded-lg bg-black px-6 py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Request Withdrawal
          </button>
        </div>
      </div>

      {/* History */}

      <PayoutHistoryTable orders={orders} />
    </div>
  );
}
