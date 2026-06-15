import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeaderUI from "@/components/vendor/vendorHeader";
import VendorOrderTrackingPageUI from "./trackingUI";

export default async function AdminOrderTrackingPage() {
  const { vendor } = await getCurrentVendor();
  if (!vendor) {
    throw new Error("Vendor not found");
  }
  return (
    <>
      <VendorHeaderUI
        title="Order Tracking"
        subtitle="View order details"
        vendor={vendor}
      />
      <VendorOrderTrackingPageUI />
    </>
  );
}
