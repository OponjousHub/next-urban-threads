import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import CouponDetail from "@/components/coupons/coupon-detail";
import { getAuthPayload } from "@/lib/server/auth";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    couponId: string;
  }>;
};

export default async function CouponDetailPage({ params }: Props) {
  const { couponId } = await params;
  const { tenant } = await getAuthPayload();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const [coupon, user] = await Promise.all([
    prisma.coupon.findFirst({
      where: {
        id: couponId,
        tenantId: tenant?.id,
      },
      include: {
        orderCoupons: {
          include: {
            order: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
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

  if (!coupon) {
    notFound();
  }

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  const totalUses = coupon.orderCoupons.length;

  const revenueGenerated = coupon.orderCoupons.reduce(
    (sum, orderCoupon) => sum + Number(orderCoupon.order.totalAmount),
    0,
  );

  const totalDiscount = coupon.orderCoupons.reduce(
    (sum, orderCoupon) => sum + Number(orderCoupon.discountAmount ?? 0),
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

    orders: coupon.orderCoupons.map((orderCoupon) => {
      const order = orderCoupon.order;

      return {
        ...order,

        totalAmount: Number(order.totalAmount),

        discountAmount: Number(orderCoupon.discountAmount ?? 0),

        commissionAmount: Number(order.commissionAmount ?? 0),

        shippingCost: Number(order.shippingCost ?? 0),

        createdAt: order.createdAt.toISOString(),

        user: {
          ...order.user,
        },
      };
    }),
  };

  const safeAverageOrderValue = Number(averageOrderValue);

  return (
    <>
      <AdminHeaderUI
        title="Coupons details"
        subtitle=" View coupon details"
        admin={admin}
      />
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
