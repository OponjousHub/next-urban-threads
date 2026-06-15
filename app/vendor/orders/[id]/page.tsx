import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import OrderDetails from "@/components/order/orderDetails";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

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

  const order = await prisma.order.findUnique({
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

  const { vendor } = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
  }

  return (
    <>
      <VendorHeaderUI
        title="Order details"
        subtitle="View order details"
        vendor={vendor}
      />
      <OrderDetails order={formattedOrder} basePath={"/vendor/orders"} />;
    </>
  );
}
