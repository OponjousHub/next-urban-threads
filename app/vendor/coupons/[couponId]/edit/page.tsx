import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import CouponForm from "@/components/coupons/coupon-form";
import { getAuthPayload } from "@/lib/server/auth";

type Props = {
  params: Promise<{
    couponId: string;
  }>;
};

export default async function EditCouponPage({ params }: Props) {
  const { couponId } = await params;

  const { vendor } = await getCurrentVendor();
  const { tenant } = await getAuthPayload();

  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
      vendorId: vendor?.id,
      tenantId: tenant?.id,
    },
  });

  if (!coupon) {
    notFound();
  }
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
  };

  return (
    <>
      <VendorHeaderUI
        title="Edit Coupon"
        subtitle="Update coupon settings"
        vendor={vendor}
      />

      <CouponForm
        mode="edit"
        coupon={safeCoupon}
        basePath={"/vendor/coupons"}
      />
    </>
  );
}
