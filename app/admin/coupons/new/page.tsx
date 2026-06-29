import CouponForm from "@/components/coupons/coupon-form";

export default async function NewCouponPage() {
  return (
    <>
      <CouponForm basePath="/admin/coupons" />
    </>
  );
}
