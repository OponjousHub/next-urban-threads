// import { prisma } from "@/utils/prisma";
// import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
// import OrderDetails from "@/components/admin/orders/orderDetails";

// interface OrderDetailsPageProps {
//   params: { id: string };
// }

// export default async function OrderDetailsPage({
//   params,
// }: OrderDetailsPageProps) {
//   const tenant = await getDefaultTenant();
//   if (!tenant) {
//     throw new Error("Default tenant not found");
//   }

//   const order = await prisma.order.findUnique({
//     where: { id: params.id, tenantId: tenant.id },
//     include: {
//       user: { select: { name: true, email: true } },
//       items: {
//         select: {
//           id: true,
//           quantity: true,
//           price: true,
//           product: { select: { name: true, images: true } }, // fetch product name & image
//         },
//       },
//     },
//   });

//   if (!order) {
//     return <p className="p-6 text-gray-500">Order not found</p>;
//   }

//   // Format order for client component
//   const formattedOrder = {
//     id: order.id,
//     createdAt: order.createdAt.toISOString(),
//     status: order.status,
//     paymentStatus: order.paymentStatus,
//     totalAmount: Number(order.totalAmount),
//     customer: order.user
//       ? { name: order.user.name ?? "Unknown", email: order.user.email }
//       : null,
//     items: order.items.map((item) => ({
//       id: item.id,
//       name: item.product?.name ?? "Unknown product",
//       image: item.product?.images?.[0] ?? "/placeholder.png",
//       quantity: Number(item.quantity),
//       price: Number(item.price),
//     })),
//   };

//   return <OrderDetails order={formattedOrder} />;
// }
import OrdersTable from "@/components/admin/orders/order-table";
import OrderFilters from "@/components/admin/orders/order-filters";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
    payment?: string;
    query?: string;
  };
}) {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found");

  const { status, payment, query } = searchParams;

  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
      ...(status && status !== "ALL" && { status }),
      ...(payment && payment !== "ALL" && { paymentStatus: payment }),
      ...(query && {
        OR: [
          { id: { contains: query } },
          { user: { email: { contains: query } } },
          { user: { name: { contains: query } } },
        ],
      }),
    },
    include: {
      user: { select: { name: true, email: true } },
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedOrders = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    total: Number(order.totalAmount),
    paymentStatus: order.paymentStatus,
    status: order.status,
    customer: order.user
      ? {
          name: order.user.name ?? "Unknown",
          email: order.user.email,
        }
      : null,
    itemsCount: order.items.length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-xl font-semibold">Orders</h1>

        <OrderFilters />
      </div>

      <OrdersTable orders={formattedOrders} />
    </div>
  );
}
