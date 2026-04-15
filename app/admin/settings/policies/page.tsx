import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import PolicyForm from "@/components/admin/settings/policy-form";

export default async function PolicyPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) return <div>No tenant found</div>;

  const data = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: {
      shippingPolicy: true,
      returnPolicy: true,
    },
  });

  return <PolicyForm initialData={data} />;
}
