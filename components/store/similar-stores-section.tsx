"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, Users, Package } from "lucide-react";

type Store = {
  id: string;
  slug: string;
  name: string;
  logo?: string | null;
  banner?: string | null;
  averageRating: number;
  productCount: number;
  followerCount: number;
};

type Props = {
  stores: Store[];
};

export default function SimilarStoresSection({ stores }: Props) {
  if (stores.length === 0) return null;

  return (
    <section className="mt-20">
      <div className="mb-8">
        <h2 className="text-3xl font-bold">You may also like</h2>

        <p className="mt-2 text-gray-500">Discover other trusted stores.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-4">
        {stores.map((store) => (
          <Link
            key={store.id}
            href={`/store/${store.slug}`}
            className="group overflow-hidden rounded-3xl border bg-white transition hover:-translate-y-1 hover:shadow-xl"
          >
            <div className="relative h-36">
              <Image
                src={store.banner || "/images/default-store-banner.jpg"}
                alt={store.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="relative px-6 pb-6">
              <div className="-mt-10 mb-4">
                <Image
                  src={store.logo || "/images/default-store-logo.png"}
                  alt={store.name}
                  width={72}
                  height={72}
                  className="rounded-full border-4 border-white bg-white object-cover shadow-lg"
                />
              </div>

              <h3 className="text-xl font-semibold">{store.name}</h3>

              <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />

                {store.averageRating.toFixed(1)}
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Package size={16} />
                {store.productCount} Products
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                <Users size={16} />
                {store.followerCount} Followers
              </div>

              <div className="mt-6 rounded-xl bg-black py-3 text-center font-medium text-white transition group-hover:bg-gray-800">
                Visit Store
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
