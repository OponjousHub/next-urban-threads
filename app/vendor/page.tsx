import VendorDashboardPage from "@/components/vendor/vendorDashboardPage";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import VendorHeader from "@/components/vendor/vendorHeader";

export default async function Page() {
  const { vendor } = await getCurrentVendor();

  return (
    <>
      <VendorHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
        vendor={vendor!}
      />
      <VendorDashboardPage />
    </>
  );
}
