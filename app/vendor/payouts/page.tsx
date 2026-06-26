import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import VendorPayoutDashboard from "@/components/vendor/payouts/vendor-payout-dashboard";

export default async function VendorPayoutPage() {
  const { tenant } = await getAuthPayload();

  const { vendor } = await getCurrentVendor();

  if (!tenant || !vendor) {
    redirect("/vendor");
  }

  // ==========================================
  // Delivered & Paid Orders
  // ==========================================

  const deliveredOrders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      vendorId: vendor.id,
      paymentStatus: "PAID",
      status: "DELIVERED",
    },

    select: {
      id: true,
      totalAmount: true,
      commissionAmount: true,
      createdAt: true,
      paymentReference: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  // ==========================================
  // Paid Payouts
  // ==========================================

  const paidPayouts = await prisma.vendorPayout.findMany({
    where: {
      tenantId: tenant.id,
      vendorId: vendor.id,
      status: "PAID",
    },

    select: {
      amount: true,
    },
  });

  // ==========================================
  // Pending Payouts
  // ==========================================

  const pendingPayouts = await prisma.vendorPayout.findMany({
    where: {
      tenantId: tenant.id,
      vendorId: vendor.id,
      status: "PENDING",
    },

    select: {
      amount: true,
    },
  });

  // ==========================================
  // Calculations
  // ==========================================

  const grossEarnings = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );

  const totalCommission = deliveredOrders.reduce(
    (sum, order) => sum + Number(order.commissionAmount ?? 0),
    0,
  );

  const netEarnings = grossEarnings - totalCommission;

  const totalPaid = paidPayouts.reduce(
    (sum, payout) => sum + Number(payout.amount),
    0,
  );

  const pendingBalance = pendingPayouts.reduce(
    (sum, payout) => sum + Number(payout.amount),
    0,
  );

  const availableBalance = netEarnings - totalPaid - pendingBalance;

  // ==========================================
  // Serialize Orders
  // ==========================================

  const safeOrders = deliveredOrders.map((order) => ({
    ...order,

    totalAmount: Number(order.totalAmount),

    commissionAmount: Number(order.commissionAmount ?? 0),

    createdAt: order.createdAt.toISOString(),
  }));

  return (
    <>
      <VendorHeaderUI
        title="Payouts"
        subtitle="Track your earnings and withdrawals"
        vendor={vendor}
      />

      <VendorPayoutDashboard
        grossEarnings={grossEarnings}
        totalCommission={totalCommission}
        netEarnings={netEarnings}
        totalPaid={totalPaid}
        pendingBalance={pendingBalance}
        availableBalance={availableBalance}
        orders={safeOrders}
      />
    </>
  );
}
