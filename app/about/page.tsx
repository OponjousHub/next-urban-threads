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
    <div className="bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 space-y-24">
        {/* HERO */}
        <section className="text-center space-y-6">
          {about.logo && (
            <img
              src={about.logo}
              alt="Brand Logo"
              className="h-16 mx-auto object-contain"
            />
          )}

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {about.title}
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
            {about.description}
          </p>
        </section>

        {/* DIVIDER */}
        <div className="border-t border-gray-100" />

        {/* PLATFORM FEATURES */}
        <section className="space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-semibold">
              Built for Modern Commerce
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              A flexible engine that scales from a single store to a full SaaS
              ecosystem.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {platformContent.about.highlights.map((item) => (
              <div
                key={item.title}
                className="p-8 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-sm transition"
              >
                <h3 className="font-semibold text-lg mb-3">{item.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* STORY SECTION */}
        <section className="bg-gray-50 rounded-3xl p-10 md:p-16 space-y-6 border border-gray-100">
          <h2 className="text-2xl md:text-3xl font-semibold">
            Why We Built This Platform
          </h2>

          <p className="text-gray-600 leading-relaxed text-lg">
            Most ecommerce platforms force businesses into rigid systems. We
            built a flexible engine that adapts to your business model instead.
          </p>

          <p className="text-gray-600 leading-relaxed text-lg">
            Whether you're running a single store, a marketplace, or a SaaS
            ecosystem, the architecture evolves with you — not against you.
          </p>
        </section>

        {/* TENANT SECTION */}
        {tenant && (
          <section className="space-y-4 text-center">
            <div className="inline-block px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-600">
              Powered by our ecommerce engine
            </div>

            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              This store is independently managed and powered by a scalable
              multi-tenant infrastructure.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}
