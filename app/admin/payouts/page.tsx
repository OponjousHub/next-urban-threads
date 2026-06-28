import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import AdminPayoutTable from "@/components/admin/payouts/admin-payout-table";
import AdminStatCard from "@/components/vendor/payouts/payout-stat-card";

export default async function AdminPayoutPage() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payouts = await prisma.vendorPayout.findMany({
    where: { tenantId: tenant.id },
    include: {
      vendor: true,
    },
    orderBy: {
      requestedAt: "desc",
    },
  });

  const pending = payouts.filter((p) => p.status === "PENDING").length;

  const approved = payouts.filter((p) => p.status === "APPROVED").length;

  const paid = payouts.filter((p) => p.status === "PAID").length;

  const rejected = payouts.filter((p) => p.status === "REJECTED").length;

  const pendingAmount = payouts
    .filter((p) => p.status === "PENDING")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPaidAmount = payouts
    .filter((p) => p.status === "PAID")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const safePayouts = payouts.map((p) => ({
    ...p,
    amount: Number(p.amount),
    requestedAt: p.requestedAt.toISOString(),
    approvedAt: p.approvedAt?.toISOString() ?? null,
    paidAt: p.paidAt?.toISOString() ?? null,
  }));

  return (
    <>
      <div className=" m-5 mb-4">
        <h1 className="text-2xl font-semibold">Vendor Payouts</h1>
        <p className="text-sm text-gray-500">
          Approve or reject vendor payout request
        </p>
      </div>
      <div className="grid gap-6 mb-8 md:grid-cols-3 xl:grid-cols-3">
        <AdminStatCard
          title="Pending Requests"
          value={pending}
          color="yellow"
        />

        <AdminStatCard title="Approved" value={approved} color="blue" />

        <AdminStatCard title="Paid" value={paid} color="green" />

        <AdminStatCard title="Rejected" value={rejected} color="red" />

        <AdminStatCard
          title="Pending Amount"
          value={`${pendingAmount.toLocaleString()}`}
          color="purple"
        />

        <AdminStatCard
          title="Total Paid"
          value={`${totalPaidAmount.toLocaleString()}`}
          color="emerald"
        />
      </div>

      <AdminPayoutTable payouts={safePayouts} />
    </>
  );
}
