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

export default async function AdminCustomerDetail({
  customer,
  address,
}: Props) {
  return (
    <div className="space-y-6">
      <CustomerDetailUI customer={customer} address={address} />
    </div>
  );
}
