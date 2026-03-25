import OrdersTable from "@/components/admin/orders/order-table";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { Order } from "@/components/admin/orders/order-row";

export default async function OrdersPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  //Query database for orders
  const orders = await prisma.order.findMany({
    where: {
      tenantId: tenant.id,
    },
    orderBy: { createdAt: "desc" },

    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      items: {
        select: {
          id: true,
        },
      },
    },
  });

  //Transform data for frontend

  const formattedOrders: Order[] = orders.map((order) => ({
    id: order.id,
    createdAt: order.createdAt,
    total: Number(order.totalAmount), // convert Decimal -> number
    paymentStatus: order.paymentStatus as "PENDING" | "PAID" | "FAILED", // cast enum
    status: order.status as
      | "PROCESSING"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED", // cast enum
    customer: order.user
      ? {
          name: order.user.name ?? "Guest",
          email: order.user.email ?? "No email",
        }
      : null,
    itemsCount: order.items.length,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Orders</h1>
      </div>

      {/* Table will go here */}
      <OrdersTable orders={formattedOrders} />
    </div>
  );
}
