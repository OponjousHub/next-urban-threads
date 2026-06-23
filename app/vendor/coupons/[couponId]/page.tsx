import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import CouponDetail from "@/components/coupons/coupon-detail";

type Props = {
  params: Promise<{
    couponId: string;
  }>;
};

export default async function CouponDetailPage({ params }: Props) {
  const { couponId } = await params;

  const { vendor } = await getCurrentVendor();

  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      vendorId: vendor?.id,
    },

    include: {
      orders: {
        select: {
          id: true,
          createdAt: true,
          totalAmount: true,
          status: true,
          customerEmail: true,
        },

        orderBy: {
          createdAt: "desc",
        },

        take: 20,
      },
    },
  });

  if (!coupon) {
    notFound();
  }

  const safeCoupon = {
    ...coupon,
    value: Number(coupon.value),

    orders: coupon.orders.map((order) => ({
      ...order,
      totalAmount: Number(order.totalAmount),
    })),
  };

  return (
    <>
      <VendorHeaderUI
        title="Coupon Details"
        subtitle="Manage coupon performance"
        vendor={vendor}
      />

      <CouponDetail coupon={safeCoupon} />
    </>
  );
}
