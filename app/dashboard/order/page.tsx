import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { cookies } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { useTenant } from "@/store/tenant-provider-context";

export default async function OrdersPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const { tenant } = useTenant();

  if (!token) {
    return <p>Please log in to view your orders.</p>;
  }

  const userId = await getLoggedInUserId();
  if (!userId) {
    return <p>Session expired. Please log in again.</p>;
  }

  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">My Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-500">You have not placed any orders yet.</p>
      )}

      {orders.map((order) => {
        const firstItem = order.items[0];
        const extraItems = order.items.length - 1;
        console.log(firstItem);

        return (
          <div key={order.id} className="border rounded-lg bg-white shadow-sm">
            {/* Order header */}
            <div className="flex flex-wrap justify-between gap-4 p-4 border-b bg-gray-50 text-sm">
              <div>
                <p className="text-gray-500">Order placed</p>
                <p className="font-medium">
                  {new Date(order.createdAt).toDateString()}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-medium">
                  {order.totalAmount.toString()} {order.currency}
                </p>
              </div>

              <div>
                <p className="text-gray-500">Status</p>
                <span
                  className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                    order.status === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.status}
                </span>
              </div>

              <div className="text-right">
                <p className="text-gray-500">Order #</p>
                <p className="font-mono text-xs">{order.id.slice(0, 8)}…</p>
              </div>
            </div>

            {/* Items preview */}
            <div className="flex items-center gap-4 p-4">
              <Image
                src={firstItem.product.images[0]}
                alt={firstItem.product.name}
                width={80}
                height={80}
                className="rounded object-cover"
              />

              <div className="flex-1">
                <p className="font-medium">{firstItem.product.name}</p>
                <p className="text-sm text-gray-500">
                  Qty: {firstItem.quantity}
                </p>

                {extraItems > 0 && (
                  <p className="text-sm text-gray-400">
                    + {extraItems} more item{extraItems > 1 && "s"}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Link
                  href={`/dashboard/order/${order.id}`}
                  className="px-4 py-2 text-sm rounded bg-black text-white hover:bg-gray-800 text-center"
                >
                  View order
                </Link>

                {order.status !== "PAID" && (
                  <Link
                    href={`/dashboard/orders/${order.id}`}
                    className="px-4 py-2 text-sm rounded border border-black text-black hover:bg-gray-100 text-center"
                  >
                    Pay now
                  </Link>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
