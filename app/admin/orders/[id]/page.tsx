import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import OrderDetails from "@/components/admin/orders/orderDetails";

interface OrderDetailsPageProps {
  params: { id: string };
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  // Fetch order and related items
  const order = await prisma.order.findUnique({
    where: { id: params.id, tenantId: tenant.id },
    include: {
      items: true, // Assuming order items are in a relation called "items"
      user: true, // Assuming customer relation exists
    },
  });

  if (!order) {
    return <p className="p-6 text-gray-500">Order not found</p>;
  }

  // Format order for client component
  const formattedOrder = {
    id: order.id,
    createdAt: order.createdAt.toISOString(),
    status: order.status,
    paymentStatus: order.paymentStatus,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((item: any) => ({
      id: item.id,
      name: item.name,
      quantity: Number(item.quantity),
      price: Number(item.price),
    })),
    customer: order.user
      ? { name: order.user.name ?? "Unknown", email: order.user.email }
      : null,
  };

  return <OrderDetails order={formattedOrder} />;
}
