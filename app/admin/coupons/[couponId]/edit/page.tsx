import { notFound } from "next/navigation";
import { prisma } from "@/utils/prisma";
import CouponForm from "@/components/coupons/coupon-form";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

type Props = {
  basePath: string;
  params: Promise<{
    couponId: string;
  }>;
};

export default async function EditCouponPage({ basePath, params }: Props) {
  const { couponId } = await params;

  const { tenant } = await getAuthPayload();

  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

  const coupon = await prisma.coupon.findFirst({
    where: {
      id: couponId,
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

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      name: true,
      email: true,
      avatarUrl: true,
    },
  });

  const admin = {
    name: user?.name,
    email: user?.email,
    avatarUrl: user?.avatarUrl,
  };

  return (
    <>
      <CouponForm
        mode="edit"
        coupon={safeCoupon}
        basePath={"/admin/coupons"}
        admin={admin}
      />
    </>
  );
}
