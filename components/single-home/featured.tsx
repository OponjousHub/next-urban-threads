"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { useTenant } from "@/store/tenant-provider-context";

export default function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const { tenant } = useTenant();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/products?featured=true");

      const data = await res.json();

      setProducts(data.products.slice(0, 8));
    }

    load();
  }, []);

  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-4xl font-bold mb-12">Featured Products</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <Link key={product.id} href={`/products/details/${product.id}`}>
              <div className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition group">
                <div className="relative h-[300px] overflow-hidden">
                  <Image
                    fill
                    src={cloudinaryImage(product.images[0])}
                    alt={product.name}
                    className="object-cover group-hover:scale-105 transition"
                  />
                </div>

                <div className="p-6">
                  <h3 className="font-medium line-clamp-2">{product.name}</h3>

                  <p className="font-bold text-xl mt-2 text-[var(--color-primary)]">
                    {tenant.currency}
                    {Number(product.price).toLocaleString()}
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
