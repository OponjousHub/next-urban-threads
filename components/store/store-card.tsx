"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Package, Users, ShieldCheck } from "lucide-react";

type Store = {
  id: string;
  slug: string;
  name: string;
  logo: string | null;
  banner: string | null;
  rating: number;
  products: number;
  followers: number;
};

type Props = {
  store: Store;
};

export default function StoreCard({ store }: Props) {
  return (
    <div className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Banner */}

      <div className="relative h-44 overflow-hidden">
        <Image
          src={store.banner || "/img/defaul-store-banner.jpg"}
          alt={store.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
      </div>

      {/* Content */}

      <div className="relative px-6 pb-6">
        {/* Logo */}

        <div className="-mt-12 mb-4">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-lg">
            {store.logo ? (
              <Image
                src={store.logo}
                alt={store.name}
                width={96}
                height={96}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-800 to-gray-600 text-3xl font-bold text-white">
                {store.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name */}

        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-gray-900">{store.name}</h2>

          <ShieldCheck size={18} className="text-blue-600" />
        </div>

        {/* Rating */}

        <div className="mt-3 flex items-center gap-2">
          <Star size={18} className="fill-yellow-400 text-yellow-400" />

          <span className="font-semibold">{store.rating.toFixed(1)}</span>
        </div>

        {/* Stats */}

        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <Package className="mx-auto mb-2 text-gray-600" size={20} />

            <p className="text-xl font-bold">{store.products}</p>

            <p className="text-sm text-gray-500">Products</p>
          </div>

          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <Users className="mx-auto mb-2 text-gray-600" size={20} />

            <p className="text-xl font-bold">{store.followers}</p>

            <p className="text-sm text-gray-500">Followers</p>
          </div>
        </div>

        {/* Button */}

        <Link
          href={`/store/${store.slug}`}
          className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-black font-medium text-white transition hover:bg-gray-800"
        >
          Visit Store
        </Link>
      </div>
    </div>
  );
}
