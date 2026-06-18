import VendorHeaderUI from "@/components/vendor/vendorHeader";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import CustomerDetailUI from "./customerDetailUI";

type Props = {
  customer: any;
  vendorId?: string;
  address?: {
    id: string;
    createdAt: Date;
    city: string;
    country: string;
    phone: string | null;
    updatedAt: Date;
    isDeleted: boolean;
    tenantId: string;
    userId: string;
    fullName: string | null;
    street: string;
    state: string | null;
  } | null;
};

export default async function VendorCustomersPage({
  customer,
  address,
}: Props) {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    throw new Error("Vendor not found");
  }

  const tenant = await getDefaultTenant();

  return (
    <div className="space-y-6">
      <VendorHeaderUI
        title="Customer Details"
        subtitle="Information about a customer"
        vendor={vendor}
      />
      <CustomerDetailUI
        customer={customer}
        address={address}
        vendorId={vendor.id}
      />
    </div>
  );
}
