import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import DOMPurify from "dompurify";

export default async function ShippingPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) return <div>No tenant found</div>;

  const data = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: { returnPolicy: true },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Return Policy</h1>
      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: data?.returnPolicy || "",
        }}
      />
    </div>
  );
}
