import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import Pagination from "@/components/products/product-pagination";
import { prisma } from "@/utils/prisma";
import Link from "next/link";
import { StoreMode } from "@prisma/client";

export default async function VendorCustomersPage({
  searchParams,
}: {
  searchParams: {
    page?: string;
  };
}) {
  const queryParams = await searchParams;
  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  // PAGINATION
  const page = Number(queryParams.page) || 1;
  const pageSize = 10;

  const skip = (page - 1) * pageSize;

  const [customers, allCustomersCount] = await Promise.all([
    prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: "USER",
        isDeleted: false,
      },
      include: {
        orders: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: pageSize,
    }),

    prisma.user.count({
      where: {
        tenantId: tenant.id,
        isDeleted: false,
        role: "USER",
      },
    }),
  ]);

  const customerRows = customers.map((customer) => ({
    id: customer.id,
    name: customer.name || "Customer",
    email: customer.email,
    status: customer.status,
    joinedAt: customer.createdAt,

    orders: customer.orders.length,

    spent: customer.orders.reduce(
      (sum, order) => sum + Number(order.totalAmount),
      0,
    ),

    lastOrder:
      customer.orders.length > 0
        ? customer.orders.sort(
            (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
          )[0].createdAt
        : null,
  }));

  // const customers = Array.from(customerMap.values());

  const totalCustomers = customerRows.length;

  const repeatBuyers = customerRows.filter((c) => c.orders > 1).length;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const newCustomers = customerRows.filter(
    (c) => c.joinedAt >= startOfMonth,
  ).length;

  //Get Total count for to get the number of pages
  const totalCustomersCount = await prisma.user.count({
    where: {
      tenantId: tenant.id,
      isDeleted: false,
    },
  });

  // const totalPages = Math.ceil(totalCustomersCount / pageSize);
  const totalPages = Math.ceil(allCustomersCount / pageSize);
  return (
    <div className="space-y-6">
      <div className="m-5">
        <h1 className="text-xl lg:text-2xl font-semibold">Customers</h1>
        <p className="hidden lg:block text-sm text-gray-500">
          Manage your customers
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4  grid-cols-3 mx-4">
        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Total Customers</p>
          <h2 className="mt-2 text-3xl font-bold">{totalCustomers}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Repeat Buyers</p>
          <h2 className="mt-2 text-3xl font-bold">{repeatBuyers}</h2>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">New This Month</p>
          <h2 className="mt-2 text-3xl font-bold">{newCustomers}</h2>
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm mx-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Orders</th>
                <th className="px-4 py-3">Spent</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Join</th>
                <th className="px-4 py-3">Last Order</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No customers yet
                  </td>
                </tr>
              ) : (
                customerRows.map((customer) => (
                  <tr key={customer.id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium">{customer.name}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {customer.email}
                    </td>
                    <td className="px-4 py-4">{customer.orders}</td>
                    <td className="px-4 py-4 font-medium">
                      {tenant?.currency}
                      {customer.spent.toLocaleString()}
                    </td>
                    <td>
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${
                          customer.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {customer.status}
                      </span>
                    </td>
                    <td>{customer.joinedAt.toLocaleDateString()}</td>
                    <td className="px-4 py-4 text-gray-600">
                      {customer.lastOrder
                        ? customer.lastOrder.toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination totalPages={totalPages} />
    </div>
  );
}
