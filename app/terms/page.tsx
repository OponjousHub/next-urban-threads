import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function TermsPage() {
  const tenant = await getDefaultTenant();

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-semibold mb-8">Terms of Service</h1>

      <div
        className="prose max-w-none"
        dangerouslySetInnerHTML={{
          __html:
            tenant?.privacyPolicy || "<p>No privacy policy available yet.</p>",
        }}
      />
    </div>
  );
}
