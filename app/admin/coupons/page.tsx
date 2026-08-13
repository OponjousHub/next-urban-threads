import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { redirect } from "next/navigation";

export default async function AdminCouponsPage() {
  const { userId, role, tenant } = await getAuthPayload();

  // ---------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  // ---------------------------------------------------------
  // Store mode
  // ---------------------------------------------------------

  const isMultiVendor = tenant.storeMode === "MULTI_VENDOR";

  // ---------------------------------------------------------
  // Fetch coupons
  //
  // SINGLE_VENDOR:
  // Only show store-wide coupons.
  //
  // MULTI_VENDOR:
  // Show store-wide coupons + vendor coupons.
  // The vendor column tells admin which vendor owns the coupon.
  // ---------------------------------------------------------

  const [coupons, user] = await Promise.all([
    prisma.coupon.findMany({
      where: {
        tenantId: tenant.id,

        ...(tenant.storeMode === "SINGLE_VENDOR"
          ? {
              vendorId: null,
            }
          : {}),
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

  // ---------------------------------------------------------
  // Admin
  // ---------------------------------------------------------

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  const now = new Date();

  // ---------------------------------------------------------
  // KPIs
  // ---------------------------------------------------------

  const totalCoupons = coupons.length;

  const activeCoupons = coupons.filter(
    (coupon) =>
      coupon.active &&
      (!coupon.startsAt || coupon.startsAt <= now) &&
      (!coupon.expiresAt || coupon.expiresAt > now),
  ).length;

  const expiredCoupons = coupons.filter(
    (coupon) => coupon.expiresAt && coupon.expiresAt < now,
  ).length;

  const totalUses = coupons.reduce((sum, coupon) => sum + coupon.usedCount, 0);

  // ---------------------------------------------------------
  // Render
  // ---------------------------------------------------------

  return (
    <>
      <AdminHeaderUI
        title="Coupons & Discounts"
        subtitle="Create and manage discount codes"
        admin={admin}
      />

      <div className="space-y-6">
        {/* =====================================================
            KPI CARDS
        ===================================================== */}

        <div className="grid gap-4 md:grid-cols-4">
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

        {/* =====================================================
            ACTIONS
        ===================================================== */}

        <div className="flex justify-end">
          <Link
            href="/admin/coupons/new"
            className="
              rounded-xl
              bg-[var(--color-primary)]
              px-4
              py-2
              font-medium
              text-white
              hover:opacity-90
            "
          >
            Create Coupon
          </Link>
        </div>

        {/* =====================================================
            COUPON TABLE
        ===================================================== */}

        <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Code</th>

                  {/* Vendor column only exists in MULTI_VENDOR */}
                  {isMultiVendor && <th className="px-4 py-3">Vendor</th>}

                  <th className="px-4 py-3">Type</th>

                  <th className="px-4 py-3">Value</th>

                  <th className="px-4 py-3">Usage</th>

                  <th className="px-4 py-3">Status</th>

                  <th className="px-4 py-3">Expires</th>

                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {coupons.length === 0 ? (
                  <tr>
                    <td
                      colSpan={isMultiVendor ? 8 : 7}
                      className="py-16 text-center text-gray-500"
                    >
                      No coupons found
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const expired = coupon.expiresAt && coupon.expiresAt < now;

                    const notStarted = coupon.startsAt && coupon.startsAt > now;

                    return (
                      <tr key={coupon.id} className="border-t hover:bg-gray-50">
                        {/* Code */}
                        <td className="px-4 py-4 font-semibold">
                          {coupon.code}
                        </td>

                        {/* Vendor */}
                        {isMultiVendor && (
                          <td className="px-4 py-4">
                            {coupon.vendor?.name ?? "Store-wide"}
                          </td>
                        )}

                        {/* Type */}
                        <td className="px-4 py-4">{coupon.type}</td>

                        {/* Value */}
                        <td className="px-4 py-4">
                          {coupon.type === "PERCENTAGE"
                            ? `${Number(coupon.value)}%`
                            : Number(coupon.value).toLocaleString()}
                        </td>

                        {/* Usage */}
                        <td className="px-4 py-4">
                          {coupon.usedCount}

                          {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {expired ? (
                            <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                              Expired
                            </span>
                          ) : notStarted ? (
                            <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-700">
                              Scheduled
                            </span>
                          ) : coupon.active ? (
                            <span className="rounded-full bg-green-100 px-2 py-1 text-xs text-green-700">
                              Active
                            </span>
                          ) : (
                            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
                              Disabled
                            </span>
                          )}
                        </td>

                        {/* Expiration */}
                        <td className="px-4 py-4">
                          {coupon.expiresAt
                            ? coupon.expiresAt.toLocaleDateString()
                            : "No Expiry"}
                        </td>

                        {/* Action */}
                        <td className="px-4 py-4">
                          <Link
                            href={`/admin/coupons/${coupon.id}`}
                            className="
                              inline-flex
                              rounded-lg
                              border
                              px-3
                              py-2
                              text-sm
                              font-medium
                              hover:bg-gray-50
                            "
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
