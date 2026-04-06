"use client";

import Image from "next/image";
import Link from "next/link";
import { useTenant } from "@/store/tenant-provider-context";

export default function Hero() {
  const { tenant } = useTenant();

  return (
    <section className="relative h-[70vh] flex items-center justify-center text-white">
      <Image
        src="/img/featured-img.jpg"
        alt="Hero"
        fill
        className="object-cover"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative text-center max-w-3xl px-6">
        <h1 className="text-5xl font-bold mb-4">{tenant.name}</h1>

        <p className="text-lg mb-6 text-gray-200">
          Discover products from multiple vendors in one place
        </p>

        <Link href="/products">
          <button className="bg-primary hover:bg-primary-dark px-8 py-3 rounded-lg font-semibold transition">
            Shop Now
          </button>
        </Link>
      </div>
    </section>
  );
}
