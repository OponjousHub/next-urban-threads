"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart } from "react-icons/fi";
import { useTenant } from "@/store/tenant-provider-context";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { ProductRating } from "@/utils/product-rating";
import { useSearchParams } from "next/navigation";

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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const flash = searchParams.get("flash");
  const router = useRouter();
  const { tenant } = useTenant();

  // Fetch all products
  useEffect(() => {
    async function loadProducts() {
      try {
        setLoadingProducts(true);
        let url = "/api/products"; // all products by default

        if (activeCategory) {
          url += `?category=${activeCategory}`;
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
  }, [activeCategory]);

  // Fetch categories
  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);
        const res = await fetch("/api/admin/category");
        const data = await res.json();
        setCategories(data || []);
      } catch (err) {
        console.error("Failed to load categories", err);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  if (loadingProducts || loadingCategories) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          {activeCategory
            ? categories.find((c) => c.slug === activeCategory)?.name +
              " Products"
            : "All Products"}
        </h1>

        {/* Categories as filter buttons */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`px-4 py-2 rounded-full font-medium transition-colors duration-200 ${
                activeCategory === cat.slug
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-primary-lightest)] text-[var(--color-primary-dark)] hover:bg-gray-200"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {/* Reset filter */}
          {activeCategory && (
            <button
              onClick={() => setActiveCategory(null)}
              className="px-4 py-2 rounded-full font-medium bg-gray-300 text-gray-700 hover:bg-gray-400 transition"
            >
              All
            </button>
          )}
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No products found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => {
            const imageUrl =
              product.images?.length > 0
                ? cloudinaryImage(product.images[0], "card")
                : "/placeholder.png";

            return (
              <div
                key={product.id}
                className="rounded-2xl overflow-hidden shadow-md hover:shadow-xl bg-white"
              >
                <div className="relative w-full h-52">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{product.name}</h3>
                  <ProductRating
                    rating={product.averageRating}
                    count={product.reviewCount}
                  />
                  <p className="font-bold text-[var(--color-primary)] my-2 text-xl">
                    ₦{product.price.toLocaleString()}
                  </p>
                  <Link href={`/products/details/${product.id}`}>
                    <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-md hover:bg-[var(--color-primary-dark)] transition">
                      <FiShoppingCart size={16} /> Add to Cart
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
