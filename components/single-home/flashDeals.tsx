"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryImage } from "@/utils/cloudinary-url";

export default function FlashDeals() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products?flash=true");

      const data = await res.json();

      setProducts(data.products);
    }

    load();
  }, []);

  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex justify-between mb-12">
          <div>
            <p className="text-red-500 font-semibold">LIMITED TIME</p>

            <h2 className="text-4xl font-bold">⚡ Flash Deals</h2>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {products.map((product: any) => (
            <Link key={product.id} href={`/products/details/${product.id}`}>
              <div className="rounded-3xl overflow-hidden border hover:shadow-xl transition">
                <div className="relative h-[300px]">
                  <Image
                    fill
                    src={cloudinaryImage(product.images[0])}
                    alt=""
                    className="object-cover"
                  />

                  <span className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-xs">
                    SALE
                  </span>
                </div>

                <div className="p-6">
                  <h3 className="font-medium">{product.name}</h3>

                  <p className="text-red-500 text-xl font-bold mt-2">
                    ₦{Number(product.price).toLocaleString()}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
