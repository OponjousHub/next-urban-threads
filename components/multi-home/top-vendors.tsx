import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";

import { getTopVendors } from "@/app/lib/vendor/getTopVendors";

export default async function TopVendors() {
  const vendors = await getTopVendors();

  if (vendors.length === 0) return null;

  return (
    <section className="px-6 py-14">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase tracking-widest text-gray-500">
            Discover
          </p>

          <h2 className="text-3xl font-bold">Top Vendors</h2>
        </div>

        <Link
          href="/stores"
          className="font-medium text-[var(--color-primary)] hover:underline"
        >
          View All
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {vendors.map((vendor) => (
          <Link
            key={vendor.id}
            href={`/store/${vendor.slug}`}
            className="group rounded-2xl border bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="flex justify-center">
              {vendor.logo ? (
                <Image
                  src={vendor.logo}
                  alt={vendor.name}
                  width={72}
                  height={72}
                  className="rounded-full border object-cover"
                />
              ) : (
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gray-100">
                  <Store size={30} className="text-gray-400" />
                </div>
              )}
            </div>

            <h3 className="mt-5 text-center text-lg font-semibold transition-colors group-hover:text-[var(--color-primary)]">
              {vendor.name}
            </h3>

            <div className="mt-5 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-lg font-bold">{vendor._count.products}</p>

                <p className="text-sm text-gray-500">Products</p>
              </div>

              <div className="text-center">
                <p className="text-lg font-bold">{vendor._count.storeFollow}</p>

                <p className="text-sm text-gray-500">Followers</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
