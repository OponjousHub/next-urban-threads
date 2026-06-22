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
          tenantId: tenant?.id,
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

  // Revenue Trends calculation
  const thirtyDaysAgo = new Date();

  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const revenueOrders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
      tenantId: tenant?.id,
      paymentStatus: "PAID",
      createdAt: {
        gte: thirtyDaysAgo,
      },
    },
    select: {
      createdAt: true,
      totalAmount: true,
    },
  });

  // Build Daily Revenue Dataset
  const revenueMap = new Map<string, number>();

  for (let i = 29; i >= 0; i--) {
    const date = new Date();

    date.setDate(date.getDate() - i);

    const key = date.toISOString().split("T")[0];

    revenueMap.set(key, 0);
  }

  revenueOrders.forEach((order) => {
    const key = order.createdAt.toISOString().split("T")[0];

    revenueMap.set(key, (revenueMap.get(key) || 0) + Number(order.totalAmount));
  });

  const revenueTrend = Array.from(revenueMap.entries()).map(
    ([date, revenue]) => ({
      date,
      revenue,
    }),
  );

  // Calculate Summary Stats
  const periodRevenue = revenueTrend.reduce((sum, day) => sum + day.revenue, 0);

  const highestDay = [...revenueTrend].sort((a, b) => b.revenue - a.revenue)[0];

  const lowestDay = [...revenueTrend].sort((a, b) => a.revenue - b.revenue)[0];

  //
  return (
    <>
      <VendorHeaderUI
        title="Analytics"
        subtitle="Track your store performance"
        vendor={vendor}
      />

      <div className="space-y-6 p-4">
        {/* KPI CARDS */}

        <div className="grid gap-4 md:grid-cols-4 xl:grid-cols-4">
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

        {/*Premium Revenue Trend Card*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Revenue Trend</h2>

              <p className="text-sm text-gray-500">Last 30 days performance</p>
            </div>

            <div className="rounded-xl bg-green-50 px-4 py-2">
              <p className="text-xs text-green-600">Revenue</p>

              <p className="font-semibold text-green-700">
                {tenant?.currency}
                {periodRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Highest Day</p>

              <p className="mt-2 text-lg font-bold">
                {tenant?.currency}
                {highestDay.revenue.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(highestDay.date).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Lowest Day</p>

              <p className="mt-2 text-lg font-bold">
                {tenant?.currency}
                {lowestDay.revenue.toLocaleString()}
              </p>

              <p className="text-sm text-gray-500">
                {new Date(lowestDay.date).toLocaleDateString()}
              </p>
            </div>

            <div className="rounded-xl border p-4">
              <p className="text-xs text-gray-500">Average Daily Revenue</p>

              <p className="mt-2 text-lg font-bold">
                {tenant?.currency}
                {(periodRevenue / 30).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
