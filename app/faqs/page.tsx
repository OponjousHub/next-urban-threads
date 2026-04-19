import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function FAQPage() {
  const tenant = await getDefaultTenant();

  const faqs = await prisma.fAQ.findMany({
    where: { tenantId: tenant!.id },
  });

  const grouped = faqs.reduce(
    (acc, faq) => {
      if (!acc[faq.category]) acc[faq.category] = [];
      acc[faq.category].push(faq);
      return acc;
    },
    {} as Record<string, typeof faqs>,
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">FAQs</h1>

      {Object.entries(grouped).map(([category, items]) => (
        <div key={category}>
          <h2 className="text-xl font-bold mt-6">{category}</h2>

          {items.map((faq) => (
            <details key={faq.id} className="border rounded p-3 mt-2">
              <summary className="cursor-pointer font-medium">
                {faq.question}
              </summary>

              <div
                className="mt-2 prose"
                dangerouslySetInnerHTML={{ __html: faq.answer }}
              />
            </details>
          ))}
        </div>
      ))}
    </div>
  );
}
