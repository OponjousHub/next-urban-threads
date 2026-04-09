"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isFeatured: boolean;
};

export default function CategoryGrid() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  // Preparing the category
  const filteredCategories = categories.filter((cat) => cat.isFeatured);

  const visibleCategories = showAll
    ? filteredCategories
    : filteredCategories.slice(0, 4);

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {visibleCategories.map((cat) => (
            <Link key={cat.id} href={`/products?category=${cat.slug}`}>
              <div className="rounded-xl overflow-hidden shadow hover:shadow-lg transition">
                <img
                  src={cat.image || "/placeholder.png"}
                  alt={cat.name}
                  className="w-full h-40 object-cover"
                />
                <div className="p-3 text-center font-medium">{cat.name}</div>
              </div>
            </Link>
          ))}
        </div>
      )}
      {filteredCategories.length > 4 && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll((prev) => !prev)}
            className="px-6 py-2 border rounded-lg hover:bg-gray-100 transition"
          >
            {showAll ? "Show Less" : "View All Categories"}
          </button>
        </div>
      )}
    </section>
  );
}
