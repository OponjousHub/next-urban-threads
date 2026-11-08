import Image from "next/image";
import Link from "next/link";
import { useTenant } from "@/store/tenant-provider-context";

export default function Hero() {
  const { tenant } = useTenant();

  return (
    <section className="relative overflow-hidden bg-white md:h-[85vh] md:min-h-[600px] md:bg-black">
      {/* Hero image */}
      <div className="relative aspect-video w-full md:absolute md:inset-0 md:h-full md:aspect-auto">
        {" "}
        <Image
          src={tenant.heroImage || "/img/default-hero-image.jpg"}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-contain md:object-cover md:scale-105"
        />
        {/* Gradual image-to-content transition on mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-white/70 to-white md:hidden" />
      </div>

      {/* Desktop image overlay */}
      <div className="absolute inset-0 hidden bg-black/40 md:block" />

      {/* Hero content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 text-gray-900 md:absolute md:inset-0 md:flex md:items-center md:py-0 md:text-white">
        <div className="max-w-xl space-y-6">
          <p className="uppercase tracking-[4px] text-sm opacity-80">
            NEW COLLECTION
          </p>

          <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight">
            {tenant.heroTitle || "Build your online store"}
          </h1>

          <p className="text-lg opacity-90">
            {tenant.heroSubtitle ||
              "Sell products from one or multiple vendors in one place"}
          </p>

          <div className="flex flex-wrap gap-4">
            <Link href="/products">
              <button className="bg-[var(--color-primary)] text-white px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
                {tenant.heroCTA || "Shop Now"}
              </button>
            </Link>

            <Link href="/products?featured=true">
              <button className="border border-gray-900 px-8 py-4 rounded-full hover:bg-gray-900 hover:text-white transition md:border-white md:hover:bg-white md:hover:text-black">
                Explore
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
