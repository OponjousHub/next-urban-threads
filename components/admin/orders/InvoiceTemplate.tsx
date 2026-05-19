"use client";

interface InvoiceItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  variantImage?: string;
  variantColor?: string;
  variantSize?: string;
}

interface InvoiceData {
  id: string;
  createdAt: string;
  paymentStatus: string;
  totalAmount: number;

  customer: {
    name: string;
    email: string;
  } | null;

  items: InvoiceItem[];
}

export default function InvoiceTemplate({ order }: { order: InvoiceData }) {
  return (
    <div id="invoice" className="bg-white p-10 text-black max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold">INVOICE</h1>

          <p className="text-sm text-gray-500 mt-2">Order #{order.id}</p>
        </div>

        <div className="text-right">
          <h2 className="font-bold text-xl">Urban Threads</h2>

          <p className="text-sm text-gray-500">support@urbanthreads.com</p>
        </div>
      </div>

      {/* CUSTOMER + ORDER INFO */}
      <div className="grid grid-cols-2 gap-10 py-8 border-b">
        <div>
          <h3 className="font-semibold mb-2">Bill To</h3>

          <p>{order.customer?.name}</p>

          <p className="text-gray-500">{order.customer?.email}</p>
        </div>

        <div className="text-right">
          <p>
            <span className="font-semibold">Date:</span>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </p>

          <p className="mt-2">
            <span className="font-semibold">Payment:</span>{" "}
            {order.paymentStatus}
          </p>
        </div>
      </div>

      {/* ITEMS */}
      <div className="mt-8">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Item</th>

              <th className="text-center">Qty</th>

              <th className="text-center">Price</th>

              <th className="text-right">Total</th>
            </tr>
          </thead>

          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b">
                <td className="py-5">
                  <div className="flex gap-3 items-center">
                    <img
                      src={item.variantImage || item.image}
                      className="w-12 h-12 rounded object-cover"
                    />

                    <div>
                      <p className="font-medium">{item.name}</p>

                      {(item.variantColor || item.variantSize) && (
                        <p className="text-sm text-gray-500">
                          {item.variantColor}
                          {item.variantColor && item.variantSize && " / "}
                          {item.variantSize}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                <td className="text-center">{item.quantity}</td>

                <td className="text-center">${item.price.toFixed(2)}</td>

                <td className="text-right font-medium">
                  ${(item.quantity * item.price).toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* TOTAL */}
      <div className="flex justify-end mt-8">
        <div className="w-72">
          <div className="flex justify-between border-t pt-4">
            <span className="font-bold text-lg">Total</span>

            <span className="font-bold text-lg">
              ${order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 text-center text-gray-500 text-sm">
        Thank you for your purchase.
      </div>
    </div>
  );
}
