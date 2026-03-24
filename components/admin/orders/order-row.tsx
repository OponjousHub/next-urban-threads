type Order = {
  id: string;
  createdAt: string;
  total: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED";
  orderStatus: "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  customer: {
    name: string;
    email: string;
  };
};

export function OrderRow({ order }: { order: Order; query?: string }) {
  const paymentStyles = {
    PENDING: "bg-yellow-100 text-yellow-700",
    PAID: "bg-green-100 text-green-700",
    FAILED: "bg-red-100 text-red-700",
  };

  const statusStyles = {
    PROCESSING: "bg-blue-100 text-blue-700",
    SHIPPED: "bg-purple-100 text-purple-700",
    DELIVERED: "bg-green-100 text-green-700",
    CANCELLED: "bg-red-100 text-red-700",
  };

  return (
    <tr className="border-b hover:bg-gray-50 transition">
      {/* Order ID */}
      <td className="py-3 px-4 font-medium">#{order.id.slice(0, 8)}</td>

      {/* Customer */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
            {order.customer.name?.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-sm">{order.customer.name}</p>
            <p className="text-xs text-gray-500">{order.customer.email}</p>
          </div>
        </div>
      </td>

      {/* Date */}
      <td className="py-3 px-4 text-gray-600 text-sm">
        {new Date(order.createdAt).toLocaleDateString()}
      </td>

      {/* Total */}
      <td className="py-3 px-4 font-medium">${order.total.toFixed(2)}</td>

      {/* Payment Status */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            paymentStyles[order.paymentStatus]
          }`}
        >
          {order.paymentStatus}
        </span>
      </td>

      {/* Order Status */}
      <td className="py-3 px-4">
        <span
          className={`px-2 py-1 text-xs rounded-full ${
            statusStyles[order.orderStatus]
          }`}
        >
          {order.orderStatus}
        </span>
      </td>

      {/* Actions */}
      <td className="py-3 px-4 text-right">
        <button className="p-2 rounded-lg hover:bg-gray-100">⋮</button>
      </td>
    </tr>
  );
}
