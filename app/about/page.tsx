import { platformContent } from "@/lib/content/platform-content";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function AboutPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found!");

  const about = tenant?.aboutTitle
    ? {
        title: tenant.aboutTitle,
        description: tenant.aboutText,
        logo: tenant.logo,
      }
    : {
        title: platformContent.about.title,
        description: platformContent.about.description,
        logo: null,
      };

  return (
    <div className="bg-white text-gray-800">
      <div className="max-w-5xl mx-auto px-6 py-20">
        {/* HERO SECTION */}
        <div className="text-center mb-16">
          {/* TENANT BRANDING */}
          {about.logo && (
            <img
              src={about.logo}
              alt="Brand Logo"
              className="h-16 mx-auto mb-6 object-contain"
            />
          )}

          <h1 className="text-4xl font-bold mb-4">{about.title}</h1>

          <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
            {about.description}
          </p>
        </div>

        {/* PLATFORM HIGHLIGHTS */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          {platformContent.about.highlights.map((item) => (
            <div
              key={item.title}
              className="border rounded-xl p-6 hover:shadow-md transition"
            >
              <h3 className="font-semibold mb-2 text-lg">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.description}</p>
            </div>
          ))}
        </div>

        {/* PLATFORM STORY SECTION */}
        <div className="bg-gray-50 rounded-2xl p-10 border">
          <h2 className="text-2xl font-semibold mb-4">
            Why We Built This Platform
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4">
            Most ecommerce systems are either too simple or too rigid. We wanted
            to build something that scales from a single store to a full
            marketplace without rebuilding everything.
          </p>

          <p className="text-gray-600 leading-relaxed">
            This engine is designed to evolve with your business—from startup
            store → marketplace → full SaaS ecosystem.
          </p>
        </div>

        {/* TENANT SECTION (ONLY IF MULTI-VENDOR) */}
        {tenant && (
          <div className="mt-16 border-t pt-10">
            <h3 className="text-lg font-semibold mb-2">About This Store</h3>
            <p className="text-gray-600 text-sm">
              You are currently viewing a store powered by our platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
