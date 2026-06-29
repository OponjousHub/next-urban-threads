import Link from "next/link";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export default async function AdminCouponsPage() {
  const { tenant } = await getAuthPayload();

  if (!tenant) {
    throw new Error("Tenant not found");
  }

  const coupons = await prisma.coupon.findMany({
    where: {
      tenantId: tenant.id,
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
  });

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
    <div className="space-y-6">
      <div className="ml-5 mt-5">
        <h1 className="text-2xl font-semibold">Coupons & Discounts</h1>
        <p className="text-sm text-gray-500">
          Create and manage discount codes
        </p>
      </div>
      {/* KPI */}
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

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Code</th>

                <th className="px-4 py-3">Vendor</th>

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
                  <td colSpan={8} className="py-16 text-center text-gray-500">
                    No coupons found
                  </td>
                </tr>
              ) : (
                coupons.map((coupon) => {
                  const expired = coupon.expiresAt && coupon.expiresAt < now;

                  return (
                    <tr key={coupon.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-4 font-semibold">{coupon.code}</td>

                      <td className="px-4 py-4">
                        {coupon.vendor?.name ?? "System"}
                      </td>

                      <td className="px-4 py-4">{coupon.type}</td>

                      <td className="px-4 py-4">
                        {coupon.type === "PERCENTAGE"
                          ? `${Number(coupon.value)}%`
                          : Number(coupon.value).toLocaleString()}
                      </td>

                      <td className="px-4 py-4">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>

                      <td className="px-4 py-4">
                        {expired ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs text-red-700">
                            Expired
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

                      <td className="px-4 py-4">
                        {coupon.expiresAt
                          ? coupon.expiresAt.toLocaleDateString()
                          : "No Expiry"}
                      </td>

                      <td className="px-4 py-4">
                        <Link
                          href={`/admin/coupons/${coupon.id}`}
                          className="inline-flex rounded-lg border px-3 py-2 text-sm font-medium hover:bg-gray-50"
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
  );
}
