import VendorHeaderUI from "@/components/vendor/vendorHeader";
// import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export default async function VendorCustomersPage() {
  //   const { vendor } = await getCurrentVendor();

  //   if (!vendor) {
  //     throw new Error("Vendor not found");
  //   }

  const tenant = await getDefaultTenant();

  const orders = await prisma.order.findMany({
    where: {
      storeMode: tenant?.storeMode,
      tenantId: tenant?.id,
    },
    include: {
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const customerMap = new Map();

  for (const order of orders) {
    if (!order.user) continue;

    const existing = customerMap.get(order.user.id);

    if (existing) {
      existing.orders += 1;
      existing.spent += Number(order.totalAmount);

      if (order.createdAt > existing.lastOrder) {
        existing.lastOrder = order.createdAt;
      }
    } else {
      customerMap.set(order.user.id, {
        id: order.user.id,
        name: order.user.name || "Customer",
        email: order.user.email,
        orders: 1,
        spent: Number(order.totalAmount),
        lastOrder: order.createdAt,
      });
    }
  }

  const customers = Array.from(customerMap.values());

  const totalCustomers = customers.length;

  const repeatBuyers = customers.filter(
    (customer) => customer.orders > 1,
  ).length;

  const startOfMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1,
  );

  const newCustomers = customers.filter(
    (customer) => customer.lastOrder >= startOfMonth,
  ).length;

  return (
    <div className="space-y-6">
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
                <th className="px-4 py-3">Last Order</th>
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
                customers.map((customer) => (
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

                    <td className="px-4 py-4 text-gray-600">
                      {customer.lastOrder.toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
