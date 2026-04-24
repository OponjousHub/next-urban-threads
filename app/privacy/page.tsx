export default async function PrivacyPage() {
  const tenant = await getDefaultTenant();

  const content =
    tenant?.privacyPolicy || "Default Privacy Policy will go here...";

  return (
    <div className="max-w-4xl mx-auto px-6 py-20">
      <h1 className="text-3xl font-semibold mb-6">Privacy Policy</h1>

      <div className="text-gray-700 leading-relaxed whitespace-pre-line">
        {content}
      </div>
    </div>
  );
}
