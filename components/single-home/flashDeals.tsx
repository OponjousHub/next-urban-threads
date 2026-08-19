"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { useTenant } from "@/store/tenant-provider-context";
import { formatCurrency } from "@/lib/formatCurrency";

type Product = {
  id: string;
  name: string;
  price: number | string;
  images: string[];
};

const MAX_HOME_FLASH_DEALS = 6;

export default function FlashDeals() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { tenant } = useTenant();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/products?flash=true", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || data.error || "Could not fetch flash deals",
          );
        }

        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (error) {
        console.error("FLASH DEALS FETCH ERROR:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Only show the first 6 products on the homepage.
  // The remaining products are available through "View all deals".
  const displayedProducts = products.slice(0, MAX_HOME_FLASH_DEALS);

  const hasMoreDeals = products.length > MAX_HOME_FLASH_DEALS;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-16">
        {/* Header */}
        <div className="mb-8">
          <div className="rounded-3xl bg-gray-950 px-6 py-8 text-white shadow-lg md:px-10">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
              Limited Time
            </p>

            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                  ⚡ Flash Deals
                </h2>

                <p className="mt-2 max-w-xl text-sm text-white/60">
                  Grab these special offers before they are gone.
                </p>
              </div>

              {!loading && products.length > 0 && (
                <Link
                  href="/products?flash=true"
                  className="inline-flex items-center gap-1 text-sm font-medium text-white transition hover:text-white/70"
                >
                  {hasMoreDeals ? "View more deals" : "View all deals"} →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm"
              >
                <div className="relative h-[280px] animate-pulse bg-gray-200 md:h-[300px]" />

                <div className="space-y-3 p-6">
                  <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              There are no flash deals available right now.
            </p>
          </div>
        ) : (
          <>
            {/* Flash Deal Products */}
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
              {displayedProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/products/details/${product.id}`}
                  className="group"
                >
                  <div className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                    {/* Image */}
                    <div className="relative h-[280px] overflow-hidden bg-gray-100 md:h-[300px]">
                      {product.images?.[0] ? (
                        <Image
                          fill
                          src={cloudinaryImage(product.images[0])}
                          alt={product.name}
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-gray-400">
                          No image
                        </div>
                      )}

                      {/* Sale badge */}
                      <span className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                        SALE
                      </span>
                    </div>

                    {/* Details */}
                    <div className="p-6">
                      <h3 className="line-clamp-2 min-h-[48px] font-medium text-gray-900">
                        {product.name}
                      </h3>

                      <p className="mt-2 text-xl font-bold text-red-500">
                        {formatCurrency(
                          Number(product.price),
                          tenant?.currency ?? "NGN",
                        )}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* View More */}
            {hasMoreDeals && (
              <div className="mt-10 flex justify-center">
                <Link
                  href="/products?flash=true"
                  className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm transition hover:border-gray-900 hover:bg-gray-900 hover:text-white"
                >
                  View more flash deals
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
