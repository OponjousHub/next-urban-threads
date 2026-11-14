import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { redirect } from "next/navigation";
import CouponsTable from "@/components/admin/coupons/CouponsTable";

export default async function AdminCouponsPage() {
  const { tenant, userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const isMultiVendor = tenant.storeMode === "MULTI_VENDOR";

  const [coupons, user] = await Promise.all([
    prisma.coupon.findMany({
      where: {
        tenantId: tenant.id,

        // SINGLE_VENDOR:
        // Only store-wide coupons.
        //
        // MULTI_VENDOR:
        // Store-wide + vendor coupons.
        ...(isMultiVendor
          ? {}
          : {
              vendorId: null,
            }),
      },

      include: {
        vendor: {
          select: {
            name: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),
  ]);

  const couponRows = coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    vendorName: coupon.vendor?.name ?? null,
    type: coupon.type,
    value: Number(coupon.value),
    usedCount: coupon.usedCount,
    usageLimit: coupon.usageLimit,
    active: coupon.active,
    expiresAt: coupon.expiresAt?.toISOString() ?? null,
  }));

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  const now = new Date();

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) => coupon.active && (!coupon.expiresAt || coupon.expiresAt > now),
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.expiresAt && coupon.expiresAt < now,
  ).length;

  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);

  return (
    <>
      <AdminHeaderUI
        title="Coupons & Discounts"
        subtitle="Create and manage discount codes"
        admin={admin}
      />

      <div className="space-y-6">
        {/* KPI */}

        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {" "}
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Coupons</p>

            <h2 className="mt-2 text-3xl font-bold">{totalCoupons}</h2>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Active Coupons</p>

            <h2 className="mt-2 text-3xl font-bold">{activeCoupons}</h2>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Expired Coupons</p>

            <h2 className="mt-2 text-3xl font-bold">{expiredCoupons}</h2>
          </div>
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Uses</p>

            <h2 className="mt-2 text-3xl font-bold">{totalUses}</h2>
          </div>
        </div>

        {/* Actions */}

        <div className="flex justify-end">
          <Link
            href="/admin/coupons/new"
            className="rounded-xl bg-[var(--color-primary)] px-4 py-2 font-medium text-white hover:opacity-90"
          >
            Create Coupon
          </Link>
        </div>

        {/* Table */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <CouponsTable coupons={couponRows} isMultiVendor={isMultiVendor} />
        </div>
      </div>
    </>
  );
}
