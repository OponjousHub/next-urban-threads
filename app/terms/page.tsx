import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function TermsPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found!");

  const content =
    tenant?.termsOfService || "Default Terms of Service will go here...";

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-semibold mb-6">Terms of Service</h1>

      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
