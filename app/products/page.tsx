"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { ProductRating } from "@/utils/product-rating";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  images: string[];
  averageRating: number;
  reviewCount: number;
  category: Category;
};

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🔥 Read URL params
  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const flash = searchParams.get("flash");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);

  /* ---------------- Fetch Products ---------------- */
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);

        let url = "/api/products";
        const params = new URLSearchParams();

        if (category) params.append("category", category);
        if (featured === "true") params.append("featured", "true");
        if (flash === "true") params.append("flash", "true");

        if (params.toString()) {
          url += `?${params.toString()}`;
        }

        const res = await fetch(url);
        const data = await res.json();

        setProducts(data.products || []);
      } catch (err) {
        console.error("Failed to load products", err);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadProducts();
  }, [category, featured, flash]);

  /* ---------------- Fetch Categories ---------------- */
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/admin/category");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /* ---------------- Loading ---------------- */
  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  /* ---------------- Dynamic Title ---------------- */
  const getTitle = () => {
    if (flash === "true") return "⚡ Flash Deals";
    if (featured === "true") return "Featured Products";
    if (category) {
      const cat = categories.find((c) => c.slug === category);
      return cat ? `${cat.name} Products` : "Products";
    }
    return "All Products";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">{getTitle()}</h1>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => router.push(`/products?category=${cat.slug}`)}
              className={`px-4 py-2 rounded-full font-medium transition ${
                category === cat.slug
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-primary-lightest)] text-[var(--color-primary-dark)] hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}

          {/* Reset */}
          {(category || featured || flash) && (
            <button
              onClick={() => router.push("/products")}
              className="px-4 py-2 rounded-full bg-gray-300 hover:bg-gray-400"
            >
              All
            </button>
          )}
        </div>
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No products found.</p>
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
                className="bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition"
              >
                {/* Badge */}
                {flash === "true" && (
                  <span className="absolute m-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                    SALE
                  </span>
                )}

                <div className="relative w-full h-44">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2">
                    {product.name}
                  </h3>

                  <ProductRating
                    rating={product.averageRating}
                    count={product.reviewCount}
                  />

                  <p className="text-[var(--color-primary)] font-bold mt-1">
                    ₦{product.price.toLocaleString()}
                  </p>

                  <Link href={`/products/details/${product.id}`}>
                    <button className="mt-2 w-full text-sm bg-black text-white py-2 rounded hover:bg-gray-800 transition flex items-center justify-center gap-2">
                      <FiShoppingCart size={14} />
                      Add to Cart
                    </button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
