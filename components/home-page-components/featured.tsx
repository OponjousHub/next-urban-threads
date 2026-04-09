"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import type { Product } from "@/types/product";

function Featured() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await fetch("/api/products?featured=true");
        const data = await res.json();

        setProducts(data.products.slice(0, 8)); // 👈 show max 8
      } catch (err) {
        console.error("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    }

    loadFeatured();
  }, []);

  return (
    <section className="px-6 md:px-16 py-16 bg-black text-white">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Featured Products</h2>

        <Link href="/products?featured=true">
          <button className="px-4 py-2 border border-white rounded-lg text-sm hover:bg-white hover:text-black transition">
            View All
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : products.length === 0 ? (
        <p className="text-gray-400">No featured products</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const imageUrl =
              product.images?.length > 0
                ? cloudinaryImage(product.images[0], "card")
                : "/placeholder.png";

            return (
              <div
                key={product.id}
                className="bg-white text-black rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >
                {/* IMAGE */}
                <div className="relative w-full h-48">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* CONTENT */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold line-clamp-2">
                    {product.name}
                  </h3>

                  <p className="text-[var(--color-primary)] font-bold">
                    ₦{product.price.toLocaleString()}
                  </p>

                  <Link href={`/products/details/${product.id}`}>
                    <button className="w-full mt-2 text-sm bg-black text-white py-2 rounded-md hover:bg-gray-800 transition">
                      View Product
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default Featured;
