"use client";

import Link from "next/link";

const categories = [
  { name: "Men", image: "/img/cat-men.jpg" },
  { name: "Women", image: "/img/cat-women.jpg" },
  { name: "Accessories", image: "/img/cat-accessories.jpg" },
];

export default function CategoryGrid() {
  return (
    <section className="px-6 py-12">
      <h2 className="text-2xl font-semibold mb-6">Shop by Category</h2>

      <div className="grid md:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={`/products/${cat.name.toLowerCase()}`}
            className="relative h-40 rounded-xl overflow-hidden group"
          >
            <img
              src={cat.image}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />

            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                {cat.name}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
