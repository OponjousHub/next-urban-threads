"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image: string;
};

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/category");

      const data = await res.json();

      setCategories(data.slice(0, 6));
    }

    load();
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">
      <div className="flex justify-between mb-10">
        <h2 className="text-4xl font-bold">Shop Categories</h2>

        <Link href="/products">View all</Link>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link key={cat.id} href={`/products?category=${cat.slug}`}>
            <div className="group rounded-3xl overflow-hidden relative h-[300px]">
              <img
                src={cat.image}
                className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/25" />

              <div className="absolute bottom-8 left-8 text-white">
                <h3 className="text-2xl font-bold">{cat.name}</h3>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
