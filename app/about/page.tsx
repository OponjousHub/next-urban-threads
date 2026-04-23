import { platformContent } from "@/lib/content/platform-content";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export default async function AboutPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found!");

  const about = tenant?.aboutTitle
    ? {
        title: tenant.aboutTitle,
        description: tenant.aboutDescription,
        story: tenant.aboutStory,
        image: tenant.aboutImage,
      }
    : {
        title: platformContent.about.title,
        description: platformContent.about.description,
        story: "",
        image: null,
      };

  return (
    <div className="bg-white text-gray-900">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 space-y-24">
        {/* 🔥 PAGE HEADER */}
        <section className="text-center space-y-4">
          <p className="text-sm text-gray-500 uppercase tracking-widest">
            About Us
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
            {about.title || "About Our Store"}
          </h1>

          {about.description && (
            <p className="text-gray-600 text-lg leading-relaxed max-w-3xl mx-auto">
              {about.description}
            </p>
          )}
        </section>

        {/* HERO IMAGE */}
        {about.image && (
          <div className="rounded-3xl overflow-hidden border border-gray-100">
            <img
              src={about.image}
              alt="About"
              className="w-full h-[300px] md:h-[420px] object-cover"
            />
          </div>
        )}

        {/* FULL STORY (🔥 THIS WAS MISSING) */}
        {about.story && (
          <section className="max-w-3xl mx-auto space-y-6">
            <h2 className="text-2xl md:text-3xl font-semibold">Our Story</h2>

            <div className="text-gray-700 leading-relaxed text-lg space-y-4">
              {about.story.split("\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

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

        {/* TENANT FOOTER */}
        <section className="space-y-4 text-center">
          <div className="inline-block px-4 py-2 rounded-full bg-gray-100 text-sm text-gray-600">
            Powered by our ecommerce engine
          </div>

          <p className="text-gray-500 text-sm max-w-xl mx-auto">
            This store is independently managed and powered by a scalable
            multi-tenant infrastructure.
          </p>
        </section>
      </div>
    </div>
  );
}
