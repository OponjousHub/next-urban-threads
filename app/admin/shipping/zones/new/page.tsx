import ShippingZoneForm from "../shipping-zone-form";
import ShippingBreadcrumb from "@/components/shipping/ShippingBreadcrumb";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

export default function NewShippingZonePage() {
  return (
    <>
      <AdminHeaderUI
        title="Create Shipping Zone"
        subtitle="Shipping zones let you organize destinations for shipping methods and rates."
      />
      <div className="space-y-6 mt-4">
        <ShippingBreadcrumb current="New Shipping Zone" />
      </div>
      <div className="mx-auto w-full max-w-5xl px-6 mt-5">
        <ShippingZoneForm />
      </div>
    </>
  );
}
