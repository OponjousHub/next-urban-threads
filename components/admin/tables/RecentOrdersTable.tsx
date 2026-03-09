"use client";

interface Order {
  id: string;
  customer: string;
  email: string;
  amount: number;
  status: "Paid" | "Pending" | "Cancelled";
  date: string;
}

const orders: Order[] = [
  {
    id: "ORD-231",
    customer: "John Doe",
    email: "john@example.com",
    amount: 120,
    status: "Paid",
    date: "Today",
  },
  {
    id: "ORD-232",
    customer: "Jane Smith",
    email: "jane@example.com",
    amount: 80,
    status: "Pending",
    date: "Today",
  },
  {
    id: "ORD-233",
    customer: "Alex Johnson",
    email: "alex@example.com",
    amount: 45,
    status: "Paid",
    date: "Yesterday",
  },
  {
    id: "ORD-234",
    customer: "Mary Lee",
    email: "mary@example.com",
    amount: 210,
    status: "Cancelled",
    date: "Yesterday",
  },
];

export default function RecentOrdersTable() {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Recent Orders</h3>
        <button className="text-sm text-indigo-600 hover:underline">
          View all
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-gray-500 border-b border-gray-100">
            <tr>
              <th className="pb-3">Order</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-gray-50 hover:bg-gray-50 transition"
              >
                <td className="py-4 font-medium text-gray-800">{order.id}</td>

                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gray-200" />
                    <div>
                      <p className="font-medium">{order.customer}</p>
                      <p className="text-xs text-gray-500">{order.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-4 font-medium">${order.amount}</td>

                <td className="py-4">
                  <StatusBadge status={order.status} />
                </td>

                <td className="py-4 text-gray-500">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Order["status"] }) {
  const styles = {
    Paid: "bg-green-100 text-green-600",
    Pending: "bg-yellow-100 text-yellow-600",
    Cancelled: "bg-red-100 text-red-600",
  };

  return (
    <span
      className={`px-2 py-1 text-xs rounded-full font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}
