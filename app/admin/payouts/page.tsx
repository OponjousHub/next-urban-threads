import { prisma } from "@/utils/prisma";
import AdminPayoutTable from "@/components/admin/payouts/admin-payout-table";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

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

  const safePayouts = payouts.map((payout) => ({
    ...payout,

    amount: Number(payout.amount),

    requestedAt: payout.requestedAt.toISOString(),

    approvedAt: payout.approvedAt?.toISOString() ?? null,

    paidAt: payout.paidAt?.toISOString() ?? null,
  }));

  return (
    <>
      <AdminPayoutTable payouts={safePayouts} />
    </>
  );
}
