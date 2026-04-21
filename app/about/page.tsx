import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { useTenant } from "@/store/tenant-provider-context";

export default async function AboutPage() {
  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Default tenant not found");

  const platformAbout = {
    title: "About Our Platform",
    description:
      "We provide a powerful ecommerce engine for modern commerce systems.",
  };

  const aboutTitle = tenant?.aboutTitle || platformAbout.title;
  const aboutText = tenant?.aboutText || platformAbout.description;

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      {/* PLATFORM SECTION */}
      <h1 className="text-3xl font-bold mb-6">{aboutTitle}</h1>

      <p className="text-gray-600 leading-relaxed mb-10">{aboutText}</p>

      {/* OPTIONAL PLATFORM FOOTER INFO */}
      <div className="border-t pt-6 text-sm text-gray-500">
        Powered by your ecommerce engine (SaaS-ready architecture)
      </div>
    </div>
  );
}
