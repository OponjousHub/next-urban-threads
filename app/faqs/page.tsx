import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function FAQPage() {
  const tenant = await getDefaultTenant();

  const faqs = await prisma.fAQ.findMany({
    where: { tenantId: tenant!.id },
  });

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">FAQs</h1>

      {faqs.map((faq) => (
        <div key={faq.id}>
          <h2 className="font-semibold">{faq.question}</h2>

          <details className="border rounded-lg p-4">
            <summary className="cursor-pointer font-semibold">
              {faq.question}
            </summary>

            <div
              className="mt-2 prose"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </details>
        </div>
      ))}
    </div>
  );
}
