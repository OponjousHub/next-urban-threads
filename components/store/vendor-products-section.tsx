"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/product/product-card";

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  discountedPrice?: number | null;
  thumbnail?: string | null;
  averageRating: number;
  reviewCount: number;
  createdAt: string | Date;
  category?: {
    id: string;
    name: string;
  } | null;
};

type Props = {
  products: Product[];
};

export default function VendorProductsSection({ products }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sort, setSort] = useState("newest");

  const categories = useMemo(() => {
    return [
      "all",
      ...new Set(products.map((p) => p.category?.name).filter(Boolean)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let data = [...products];

    if (search) {
      data = data.filter((product) =>
        product.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (category !== "all") {
      data = data.filter((product) => product.category?.name === category);
    }

    switch (sort) {
      case "price-low":
        data.sort(
          (a, b) =>
            Number(a.discountedPrice ?? a.price) -
            Number(b.discountedPrice ?? b.price),
        );
        break;

      case "price-high":
        data.sort(
          (a, b) =>
            Number(b.discountedPrice ?? b.price) -
            Number(a.discountedPrice ?? a.price),
        );
        break;

      case "rating":
        data.sort((a, b) => b.averageRating - a.averageRating);
        break;

      default:
        data.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }

    return data;
  }, [products, search, category, sort]);

  return (
    <section id="products" className="mt-20">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-3xl font-bold">Products</h2>

          <p className="mt-2 text-gray-500">
            {filteredProducts.length} products
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border px-4 py-3"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border px-4 py-3"
          >
            <option value="newest">Newest</option>

            <option value="price-low">Price: Low to High</option>

            <option value="price-high">Price: High to Low</option>

            <option value="rating">Best Rated</option>
          </select>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-5 py-2 text-sm font-medium transition ${
              category === item
                ? "bg-black text-white"
                : "border bg-white hover:bg-gray-50"
            }`}
          >
            {item === "all" ? "All" : item}
          </button>
        ))}
      </div>

      {filteredProducts.length === 0 ? (
        <div className="mt-20 rounded-3xl border bg-gray-50 py-20 text-center">
          <h3 className="text-2xl font-semibold">No products found</h3>

          <p className="mt-3 text-gray-500">Try another search or category.</p>
        </div>
      ) : (
        <div className="mt-12 grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
