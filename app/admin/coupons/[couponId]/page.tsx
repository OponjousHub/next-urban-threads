import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import CouponDetail from "@/components/coupons/coupon-detail";
import { getAuthPayload } from "@/lib/server/auth";

type Props = {
  params: Promise<{
    couponId: string;
  }>;
};

export default async function CouponDetailPage({ params }: Props) {
  const { couponId } = await params;
  const { tenant } = await getAuthPayload();

  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      tenantId: tenant?.id,
    },

    include: {
      orders: {
        include: {
          user: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!coupon) {
    notFound();
  }

  const totalUses = coupon.orders.length;

  const revenueGenerated = coupon.orders.reduce(
    (sum, order) => sum + Number(order.totalAmount),
    0,
  );

  const totalDiscount = coupon.orders.reduce(
    (sum, order) => sum + Number(order.discountAmount ?? 0),
    0,
  );

  const averageOrderValue = totalUses === 0 ? 0 : revenueGenerated / totalUses;

  const safeCoupon = {
    ...coupon,

    value: Number(coupon.value),

    minimumAmount: coupon.minimumAmount ? Number(coupon.minimumAmount) : null,

    startsAt: coupon.startsAt
      ? new Date(coupon.startsAt).toISOString().slice(0, 16)
      : "",

    expiresAt: coupon.expiresAt
      ? new Date(coupon.expiresAt).toISOString().slice(0, 16)
      : "",

    orders: coupon.orders.map((order) => ({
      ...order,

      totalAmount: Number(order.totalAmount),

      discountAmount: Number(order.discountAmount ?? 0),

      commissionAmount: Number(order.commissionAmount ?? 0),

      createdAt: order.createdAt.toISOString(),

      user: {
        ...order.user,
      },
    })),
  };

  const safeAverageOrderValue = Number(averageOrderValue);
  return (
    <>
      <CouponDetail
        coupon={safeCoupon}
        revenueGenerated={revenueGenerated}
        avgOrderValue={safeAverageOrderValue}
        totalDiscount={totalDiscount}
        basePath="/admin/coupons"
      />
    </>
  );
}
