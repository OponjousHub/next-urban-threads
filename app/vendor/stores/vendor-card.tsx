import Image from "next/image";
import Link from "next/link";
import { Package, Users, Store } from "lucide-react";

import FollowStoreButton from "@/components/store/follow-store-button";

type VendorCardProps = {
  vendor: {
    id: string;
    slug: string;
    name: string;
    logo: string | null;
    banner: string | null;

    _count: {
      products: number;
      storeFollow: number;
    };
  };
};

export default function VendorCard({ vendor }: VendorCardProps) {
  return (
    <article className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Banner */}
      <Link href={`/store/${vendor.slug}`}>
        <div className="relative h-36 overflow-hidden bg-gray-100">
          {vendor.banner ? (
            <Image
              src={vendor.banner || "/img/default-store-banner.jpg"}
              alt={vendor.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-r from-gray-100 to-gray-200">
              <Store size={48} className="text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      <div className="relative px-6 pb-6">
        {/* Logo */}
        <div className="-mt-10 flex justify-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
            {vendor.logo ? (
              <Image
                src={vendor.logo}
                alt={vendor.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-100">
                <Store size={32} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>

        {/* Store Name */}
        <Link href={`/stores/${vendor.slug}`}>
          <h3 className="mt-4 text-center text-lg font-semibold transition-colors group-hover:text-[var(--color-primary)]">
            {vendor.name}
          </h3>
        </Link>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <Package
              size={18}
              className="mx-auto mb-2 text-[var(--color-primary)]"
            />

            <p className="text-lg font-bold">{vendor._count.products}</p>

            <p className="text-xs text-gray-500">Products</p>
          </div>

          <div className="rounded-xl bg-gray-50 p-3 text-center">
            <Users
              size={18}
              className="mx-auto mb-2 text-[var(--color-primary)]"
            />

            <p className="text-lg font-bold">{vendor._count.storeFollow}</p>

            <p className="text-xs text-gray-500">Followers</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-6 space-y-3">
          <FollowStoreButton vendorId={vendor.id} size="compact" />

          <Link
            href={`/stores/${vendor.slug}`}
            className="block rounded-xl border py-3 text-center font-medium transition hover:bg-gray-50"
          >
            Visit Store
          </Link>
        </div>
      </div>
    </article>
  );
}
