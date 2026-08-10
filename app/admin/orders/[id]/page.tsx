import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import OrderDetails from "@/components/order/orderDetails";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

interface OrderDetailsPageProps {
  params: { id: string };
}

export default async function OrderDetailsPage({
  params,
}: OrderDetailsPageProps) {
  const tenant = await getDefaultTenant();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const [order, user] = await Promise.all([
    prisma.order.findUnique({
      where: { id: params.id, tenantId: tenant.id },
      include: {
        user: { select: { name: true, email: true } },
        items: {
          select: {
            id: true,

            quantity: true,

            price: true,

            image: true,

            variantColor: true,

            variantSize: true,

            product: {
              select: {
                name: true,
                images: true,
              },
            },
          },
        },
      },
    }),

    prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        name: true,
        email: true,
        avatarUrl: true,
      },
    }),
  ]);

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
    customer: order.user
      ? { name: order.user.name ?? "Unknown", email: order.user.email }
      : null,
    items: order.items.map((item) => ({
      id: item.id,
      name: item.product?.name ?? "Unknown product",
      image: item.image || item.product?.images?.[0] || "/placeholder.png",
      quantity: Number(item.quantity),
      price: Number(item.price),
      variantImage: item.image,
      variantColor: item.variantColor,
      variantSize: item.variantSize,
    })),
  };

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <AdminHeaderUI
        title="Orders "
        subtitle="View customer order details"
        admin={admin}
      />
      <OrderDetails order={formattedOrder} basePath={"/admin/orders"} />;
    </>
  );
}
