import VendorHeaderUI from "@/components/vendor/vendorHeader";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { CustomerTable } from "@/components/customers/customer-table";

export default async function VendorCustomersPage() {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const tenant = await getDefaultTenant();

  const orders = await prisma.order.findMany({
    where: {
      vendorId: vendor.id,
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
      <VendorHeaderUI
        title="Customers"
        subtitle="Customers who purchased from your store"
        vendor={vendor}
      />

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
      <CustomerTable customers={customers} vendor={vendor} />
    </div>
  );
}
