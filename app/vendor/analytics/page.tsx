import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { notFound } from "next/navigation";

export default async function VendorAnalyticsPage() {
  const { vendor } = await getCurrentVendor();
  const tenant = await getDefaultTenant();

  if (!vendor) notFound();

  const [orders, totalProducts, totalCustomers, totalReviews, pendingReviews] =
    await Promise.all([
      prisma.order.findMany({
        where: {
          vendorId: vendor.id,
          paymentStatus: "PAID",
        },
      }),

      prisma.product.count({
        where: {
          vendorId: vendor.id,
          deletedAt: null,
        },
      }),

      prisma.user.count({
        where: {
          vendorId: vendor.id,
          isDeleted: false,
        },
      }),

      prisma.review.count({
        where: {
          product: {
            vendorId: vendor.id,
          },
        },
      }),

      prisma.review.count({
        where: {
          status: "PENDING",
          product: {
            vendorId: vendor.id,
          },
        },
      }),
    ]);

  /* ---------------- REVENUE ---------------- */

  const totalRevenue = orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );

  /* ---------------- ORDERS ---------------- */

  const totalOrders = orders.length;

  /* ---------------- AVERAGE ORDER VALUE ---------------- */

  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  /* ---------------- THIS MONTH REVENUE ---------------- */

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const monthRevenue = orders
    .filter((order) => order.createdAt >= startOfMonth)
    .reduce((sum, order) => sum + Number(order.totalAmount), 0);

  return (
    <>
      <VendorHeaderUI
        title="Analytics"
        subtitle="Track your store performance"
        vendor={vendor}
      />

      <div className="space-y-6 p-4">
        {/* KPI CARDS */}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Revenue</p>

            <h2 className="mt-2 text-3xl font-bold">
              {tenant?.currency}
              {totalRevenue.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Orders</p>

            <h2 className="mt-2 text-3xl font-bold">{totalOrders}</h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Customers</p>

            <h2 className="mt-2 text-3xl font-bold">{totalCustomers}</h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Products</p>

            <h2 className="mt-2 text-3xl font-bold">{totalProducts}</h2>
          </div>
        </div>

        {/* SECOND ROW */}

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Revenue This Month</p>

            <h2 className="mt-2 text-3xl font-bold">
              {tenant?.currency}
              {monthRevenue.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Avg Order Value</p>

            <h2 className="mt-2 text-3xl font-bold">
              {tenant?.currency}
              {averageOrderValue.toLocaleString()}
            </h2>
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Reviews</p>

            <h2 className="mt-2 text-3xl font-bold">{totalReviews}</h2>

            <p className="mt-2 text-sm text-amber-600">
              {pendingReviews} pending moderation
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
