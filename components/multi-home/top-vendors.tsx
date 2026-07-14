"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";

type Vendor = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;

  _count: {
    followers: number;
    products: number;
  };
};

export default function TopVendors() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVendors();
  }, []);

  async function loadVendors() {
    try {
      const res = await fetch("/api/vendor/top");

      if (!res.ok) return;

      const data = await res.json();

      setVendors(data);
    } finally {
      setLoading(false);
    }
  }
  console.log("VENDORS", vendors);
  if (!loading && vendors.length === 0) {
    return null;
  }

  return (
    <section className="px-6 py-14">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Discover
          </p>

          <h2 className="text-3xl font-bold">Top Vendors</h2>
        </div>

        <Link
          href="/stores"
          className="text-[var(--color-primary)] font-medium hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/stores/${vendor.slug}`}
            className="group rounded-2xl border bg-white p-6 hover:-translate-y-1 hover:shadow-xl transition-all duration-300"
          >
            <div className="flex justify-center">
              {vendor.logo ? (
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  width={72}
                  height={72}
                  className="rounded-full object-cover border"
                />
              ) : (
                <div className="h-[72px] w-[72px] rounded-full bg-gray-100 flex items-center justify-center">
                  <Store className="text-gray-400" size={32} />
                </div>
              )}
            </div>

            <h3 className="mt-5 text-center font-semibold text-lg group-hover:text-[var(--color-primary)] transition-colors">
              {vendor.name}
            </h3>

            <div className="mt-4 flex justify-center gap-6 text-sm text-gray-500">
              <div className="text-center">
                <p className="font-bold text-gray-900">
                  {vendor._count.products}
                </p>
                <p>Products</p>
              </div>

              <div className="text-center">
                <p className="font-bold text-gray-900">
                  {vendor._count.followers}
                </p>
                <p>Followers</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
