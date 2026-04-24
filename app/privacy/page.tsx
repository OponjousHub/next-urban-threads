import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function PrivacyPage() {
  const tenant = await getDefaultTenant();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-semibold mb-8">Privacy policy</h1>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html: tenant?.termsOfService || "<p>No terms available yet.</p>",
        }}
      />
    </div>
  );
}
