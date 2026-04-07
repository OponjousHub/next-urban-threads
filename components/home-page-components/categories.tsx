"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category"); // 🔥 public endpoint
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    }

    loadCategories();
  }, []);

  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>

      {/* ✅ Loading State */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400">No categories available</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/products?category=${cat.slug}`} // ✅ better than name
              className="relative h-40 rounded-xl overflow-hidden group"
            >
              {/* Image */}
              <img
                src={cat.image || "/img/placeholder.jpg"}
                alt={cat.name}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <span className="text-white font-semibold text-lg">
                  {cat.name}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
