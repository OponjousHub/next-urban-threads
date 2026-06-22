import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import CustomerGrowthChart from "@/components/vendor/analytics/customer-growth-chart";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function VendorAnalyticsPage() {
  const { vendor } = await getCurrentVendor();
  const tenant = await getDefaultTenant();

  if (!vendor) notFound();

  const [
    orders,
    orderStatusData,
    totalProducts,
    totalCustomers,
    totalReviews,
    pendingReviews,
  ] = await Promise.all([
    prisma.order.findMany({
      where: {
        vendorId: vendor.id,
        tenantId: tenant?.id,
        paymentStatus: "PAID",
      },
    }),

    prisma.order.groupBy({
      by: ["status"],
      where: {
        vendorId: vendor.id,
        tenantId: tenant?.id,
      },
      _count: {
        status: true,
      },
    }),

    prisma.product.count({
      where: {
        vendorId: vendor.id,
        tenantId: tenant?.id,
        deletedAt: null,
      },
    }),

    prisma.user.count({
      where: {
        vendorId: vendor.id,
        tenantId: tenant?.id,
        isDeleted: false,
      },
    }),

    prisma.review.count({
      where: {
        product: {
          vendorId: vendor.id,
          tenantId: tenant?.id,
        },
      },
    }),

    prisma.review.count({
      where: {
        tenantId: tenant?.id,
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

  //Fetch Top Products
  const topProductsRaw = await prisma.orderItem.findMany({
    where: {
      order: {
        vendorId: vendor.id,
        paymentStatus: "PAID",
      },
    },
    include: {
      product: true,
    },
  });

  // Aggregate Product Performance
  const productMap = new Map();

  for (const item of topProductsRaw) {
    const productId = item.product.id;

    const revenue = Number(item.price) * item.quantity;

    if (productMap.has(productId)) {
      const existing = productMap.get(productId);

      existing.unitsSold += item.quantity;
      existing.revenue += revenue;
    } else {
      productMap.set(productId, {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        thumbnail: item.product.thumbnail,
        unitsSold: item.quantity,
        revenue,
      });
    }
  }

  // Sort Best Sellers
  const topProducts = Array.from(productMap.values())
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Fetch Customer Analytics
  const customers = await prisma.user.findMany({
    where: {
      tenantId: tenant?.id,
      orders: {
        some: {
          vendorId: vendor.id,
          paymentStatus: "PAID",
        },
      },
    },

    include: {
      orders: {
        where: {
          vendorId: vendor.id,
          paymentStatus: "PAID",
        },
      },
    },
  });

  // Total Customers
  const totalVendorCustomers = customers.length;

  const newCustomers = customers.filter(
    (customer) => customer.createdAt >= startOfMonth,
  ).length;

  // Repeat Buyers
  const repeatBuyers = customers.filter(
    (customer) => customer.orders.length > 1,
  ).length;

  // Average Customer Value
  const totalCustomerRevenue = customers.reduce(
    (sum, customer) =>
      sum +
      customer.orders.reduce(
        (orderSum, order) => orderSum + Number(order.totalAmount),
        0,
      ),
    0,
  );

  const averageCustomerValue =
    totalCustomers > 0 ? totalCustomerRevenue / totalCustomers : 0;

  // Build Monthly Customer Growth Data
  const months: {
    label: string;
    count: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    months.push({
      label: date.toLocaleString("default", {
        month: "short",
        year: "numeric",
      }),
      count: 0,
    });
  }

  customers.forEach((customer) => {
    const monthLabel = customer.createdAt.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    const existing = months.find((m) => m.label === monthLabel);

    if (existing) {
      existing.count += 1;
    }
  });

  const customerGrowthData = months.map((m) => ({
    month: m.label,
    customers: m.count,
  }));

  // Converting other status for chart
  const salesByStatus = orderStatusData.map((item) => ({
    status: item.status,
    count: item._count.status,
  }));

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

        {/* Revenue Trend Card*/}
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

        {/*Customer Growth Trend Card*/}
        <CustomerGrowthChart data={customerGrowthData} />

        {/*Top Products*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Top Products</h2>

              <p className="text-sm text-gray-500">
                Best performing products by revenue
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50 text-left">
                  <th className="px-4 py-3">Product</th>

                  <th className="px-4 py-3">Units Sold</th>

                  <th className="px-4 py-3">Revenue</th>

                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>

              <tbody>
                {topProducts.map((product, index) => (
                  <tr key={product.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <span
                          className="
                            flex h-8 w-8 items-center
                            justify-center rounded-full
                           bg-blue-100 text-blue-700
                            text-xs font-bold
  "
                        >
                          #{index + 1}
                        </span>
                        <img
                          src={product.thumbnail}
                          alt={product.name}
                          className="h-12 w-12 rounded-lg border object-cover"
                        />

                        <div>
                          <p className="font-medium">{product.name}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">{product.unitsSold}</td>

                    <td className="px-4 py-4 font-semibold">
                      {tenant?.currency}
                      {product.revenue.toLocaleString()}
                    </td>

                    <td className="px-4 py-4">
                      <Link
                        href={`/vendor/products/${product.id}`}
                        className="
                  inline-flex items-center
                  rounded-lg border
                  px-3 py-1.5
                  text-sm font-medium
                  hover:bg-gray-50
                "
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/*Customer KPI*/}
        <div className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Customer Analytics</h2>

            <p className="text-sm text-gray-500">
              Customer growth and loyalty metrics
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Total Customers</p>

              <p className="mt-2 text-3xl font-bold">{totalVendorCustomers}</p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">New This Month</p>

              <p className="mt-2 text-3xl font-bold">{newCustomers}</p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Repeat Buyers</p>

              <p className="mt-2 text-3xl font-bold">{repeatBuyers}</p>
            </div>

            <div className="rounded-xl border p-5">
              <p className="text-sm text-gray-500">Avg Customer Value</p>

              <p className="mt-2 text-3xl font-bold">
                {tenant?.currency}
                {averageCustomerValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
