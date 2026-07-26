import ShippingZoneForm from "../shipping-zone-form";

export default function NewShippingZonePage() {
  return (
    <div className="mx-auto w-full max-w-5xl px-6 mt-5">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Shipping Zone</h1>

        <p className="mt-2 text-sm text-gray-500">
          Shipping zones let you organize destinations for shipping methods and
          rates.
        </p>
      </div>

      <ShippingZoneForm />
    </div>
  );
}
