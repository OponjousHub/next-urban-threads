"use client";

import Image from "next/image";
import Link from "next/link";
import { useTenant } from "@/store/tenant-provider-context";

export default function Hero() {
  const { tenant } = useTenant();

  return (
    <section className="relative h-[85vh] overflow-hidden">
      <Image
        src={tenant.heroImage}
        alt=""
        fill
        priority
        className="object-cover scale-105"
      />

      <div className="absolute inset-0 bg-black/40" />

      <div className="relative z-10 h-full max-w-7xl mx-auto px-6 flex items-center">
        <div className="max-w-xl text-white space-y-6">
          <p className="uppercase tracking-[4px] text-sm opacity-80">
            NEW COLLECTION
          </p>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            {tenant.heroTitle}
          </h1>

          <p className="text-lg opacity-90">{tenant.heroSubtitle}</p>

          <div className="flex gap-4">
            <Link href="/products">
              <button className="bg-[var(--color-primary)] px-8 py-4 rounded-full font-semibold hover:scale-105 transition">
                Shop Now
              </button>
            </Link>

            <Link href="/products?featured=true">
              <button className="border border-white px-8 py-4 rounded-full hover:bg-white hover:text-black transition">
                Explore
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
