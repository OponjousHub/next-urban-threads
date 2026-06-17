"use client";

import { useRouter } from "next/navigation";
import { useTenant } from "@/store/tenant-provider-context";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  phone: string | null;
  totalOrders: number;
  totalSpent: number;
  spent: number;
  lastOrder: Date | null;
};

type Props = {
  customers: Customer[];
};

export function CustomerTable({ customers }: Props) {
  const { tenant } = useTenant();
  const router = useRouter();
  return (
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
                <tr
                  key={customer.id}
                  onClick={() =>
                    router.push(`/vendor/customers/${customer.id}`)
                  }
                  className="border-t hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-4 py-4 font-medium">{customer.name}</td>

                  <td className="px-4 py-4 text-gray-600">{customer.email}</td>

                  <td className="px-4 py-4">{customer.totalOrders}</td>

                  <td className="px-4 py-4 font-medium">
                    {tenant.currency}
                    {customer.spent.toLocaleString()}
                  </td>

                  <td className="px-4 py-4 text-gray-600">
                    {customer?.lastOrder?.toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
