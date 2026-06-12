import VendorDashboardPage from "@/components/vendor/vendorDashboardPage";
import VendorHeader from "@/components/vendor/vendorHeader";

export default function Page() {
  return (
    <>
      <VendorHeader
        title="Dashboard"
        subtitle="Overview of your store performance"
      />
      <VendorDashboardPage />;
    </>
  );
}
