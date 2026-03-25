import { OrderRow } from "./order-row";
import { Order } from "./order-row";

export default function OrdersTable({
  orders,
  query,
}: {
  orders: Order[];
  query?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
          <tr>
            <th className="py-3 px-4">Order</th>
            <th className="py-3 px-4">Customer</th>
            <th className="py-3 px-4">Date</th>
            <th className="py-3 px-4">Total</th>
            <th className="py-3 px-4">Payment</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center py-10 text-gray-500">
                No orders found
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <OrderRow key={order.id} order={order} query={query} />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
