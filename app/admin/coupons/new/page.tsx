import CouponForm from "@/components/coupons/coupon-form";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { redirect } from "next/navigation";

export default async function NewCouponPage() {
  const { userId, role } = await getAuthPayload();

  if (!userId) {
    redirect("/login");
  }

  if (role !== "ADMIN" && role !== "OWNER") {
    redirect("/");
  }

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
      <CouponForm basePath="/admin/coupons" admin={admin} />
    </>
  );
}
