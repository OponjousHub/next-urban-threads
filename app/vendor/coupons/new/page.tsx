import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import CouponForm from "@/components/coupons/coupon-form";

export default async function NewCouponPage() {
  const { vendor } = await getCurrentVendor();

  return (
    <>
      <VendorHeaderUI
        title="Create Coupon"
        subtitle="Create a discount code for customers"
        vendor={vendor}
      />

      <CouponForm vendorId={vendor?.id} basePath="/vendor/coupons" />
    </>
  );
}
