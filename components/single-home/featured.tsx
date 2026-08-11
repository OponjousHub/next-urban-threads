"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { useTenant } from "@/store/tenant-provider-context";
import { formatCurrency } from "@/lib/formatCurrency";

type Product = {
  id: string;
  name: string;
  price: number | string;
  images: string[];
};

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const { tenant } = useTenant();

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);

        const res = await fetch("/api/products?featured=true", {
          cache: "no-store",
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(
            data.message || data.error || "Could not fetch featured products",
          );
        }

        setProducts(
          Array.isArray(data.products) ? data.products.slice(0, 8) : [],
        );
      } catch (error) {
        console.error("FEATURED PRODUCTS FETCH ERROR:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      <section className="py-16">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[var(--color-primary)]">
              Handpicked for you
            </p>

            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Featured Products
            </h2>
          </div>

          {!loading && products.length > 0 && (
            <Link
              href="/products?featured=true"
              className="text-sm font-medium text-gray-600 transition hover:text-[var(--color-primary)]"
            >
              View all →
            </Link>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl bg-white shadow-sm"
              >
                <div className="h-[240px] animate-pulse bg-gray-200 sm:h-[280px] lg:h-[300px]" />

                <div className="space-y-3 p-5 lg:p-6">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                  <div className="mt-4 h-6 w-1/3 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 px-6 py-12 text-center">
            <p className="text-sm text-gray-500">
              No featured products available right now.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4 lg:gap-8">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/details/${product.id}`}
                className="group"
              >
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm transition duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
                  {/* Image */}
                  <div className="relative h-[240px] overflow-hidden bg-gray-100 sm:h-[280px] lg:h-[300px]">
                    {product.images?.[0] ? (
                      <Image
                        fill
                        src={cloudinaryImage(product.images[0])}
                        alt={product.name}
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 300px"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 lg:p-6">
                    <h3 className="line-clamp-2 min-h-[48px] font-medium text-gray-900">
                      {product.name}
                    </h3>

                    <p className="mt-2 text-lg font-bold text-[var(--color-primary)] lg:text-xl">
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
        )}
      </section>{" "}
    </div>
  );
}
