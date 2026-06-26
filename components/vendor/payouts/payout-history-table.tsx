"use client";

import { useTenant } from "@/store/tenant-provider-context";

type Order = {
  id: string;
  paymentReference: string;
  totalAmount: number;
  commissionAmount: number;
  createdAt: string;
};

type Props = {
  orders: Order[];
};

export default function PayoutHistoryTable({ orders }: Props) {
  const { tenant } = useTenant();

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <div className="border-b p-5">
        <h2 className="text-lg font-semibold">Earnings History</h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-5 py-3 text-left text-sm">Date</th>

              <th className="px-5 py-3 text-left text-sm">Reference</th>

              <th className="px-5 py-3 text-right text-sm">Sale</th>

              <th className="px-5 py-3 text-right text-sm">Commission</th>

              <th className="px-5 py-3 text-right text-sm">Vendor Earned</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => {
              const earned = order.totalAmount - order.commissionAmount;

              return (
                <tr key={order.id} className="border-t">
                  <td className="px-5 py-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>

                  <td className="px-5 py-4">{order.paymentReference}</td>

                  <td className="px-5 py-4 text-right">
                    {tenant?.currency}
                    {order.totalAmount.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-right text-red-600">
                    {tenant?.currency}
                    {order.commissionAmount.toLocaleString()}
                  </td>

                  <td className="px-5 py-4 text-right font-semibold text-green-700">
                    {tenant?.currency}
                    {earned.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
