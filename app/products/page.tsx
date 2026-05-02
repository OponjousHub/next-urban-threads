"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiSearch } from "react-icons/fi";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { ProductRating } from "@/utils/product-rating";
import { ProductSkeleton } from "@/components/products/productSkeleton";
import QuickViewModal from "@/components/products/quickViewModal";

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
  const searchQuery = searchParams.get("search");
  const pageParam = Number(searchParams.get("page") || "1");
  const params = new URLSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(pageParam);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  if (category) params.append("category", category);
  if (featured === "true") params.append("featured", "true");
  if (flash === "true") params.append("flash", "true");
  if (searchQuery) params.append("search", searchQuery);

  // ✅ ADD PAGINATION
  params.append("page", String(page));
  params.append("limit", "12");

  /* ---------------- Fetch Products ---------------- */

  const loadProducts = async (nextPage = 1, replace = false) => {
    try {
      if (nextPage === 1) setLoadingProducts(true);
      else setLoadingMore(true);

      const params = new URLSearchParams();

      if (category) params.append("category", category);
      if (featured === "true") params.append("featured", "true");
      if (flash === "true") params.append("flash", "true");
      if (searchQuery) params.append("search", searchQuery);

      params.append("page", String(nextPage));
      params.append("limit", "12");

      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();

      setProducts((prev) =>
        replace ? data.products : [...prev, ...data.products],
      );

      setHasMore(nextPage < data.totalPages);
      setPage(nextPage);

      const newParams = new URLSearchParams(window.location.search);
      newParams.set("page", String(nextPage));

      window.history.replaceState(null, "", `?${newParams.toString()}`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  };

  // Initial load + filter reset
  useEffect(() => {
    loadProducts(1, true); // reset products
  }, [category, featured, flash, searchQuery]);

  /* --------------- Infinite scroll - auto trigger --------------*/
  useEffect(() => {
    const handleScroll = () => {
      if (loadingMore || !hasMore) return;

      const nearBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200;

      if (nearBottom) {
        loadProducts(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, hasMore, loadingMore]);

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
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search?.trim()) return;

    router.push(`/products?search=${encodeURIComponent(search)}&page=1`);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            {getTitle()}
          </h1>
          <p className="text-sm text-gray-500">
            Showing {products.length} products
          </p>{" "}
        </div>
        {/* RIGHT: SEARCH (mobile + desktop) */}
        <div className="md:hidden px-4 mb-4">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-2 border rounded-full px-4 py-2 bg-white"
          >
            <FiSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 outline-none text-sm"
            />
            <button
              type="submit"
              className="font-bold text-sm text-white bg-[var(--color-primary)]"
            >
              Search
            </button>
          </form>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                router.push(`/products?category=${cat.slug}&page=1`)
              }
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all
      ${
        category === cat.slug
          ? "bg-black text-white shadow"
          : "bg-gray-100 hover:bg-gray-200"
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
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 hover:-translate-y-1 transition-all duration-300">
          {products.map((product) => {
            const imageUrl =
              product.images?.length > 0
                ? cloudinaryImage(product.images[0], "card")
                : "/placeholder.png";

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300"
              >
                {/* IMAGE */}
                <div className="relative w-full h-56 overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* HOVER ACTIONS */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
                    {/* <button className="bg-white p-2 rounded-full shadow hover:bg-gray-100">
                      ❤️
                    </button> */}
                    <button
                      onClick={() => setSelectedProduct(product)}
                      className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
                    >
                      👁️
                    </button>
                  </div>

                  {/* BADGE */}
                  {flash === "true" && (
                    <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
                      Sale
                    </span>
                  )}
                </div>

                {/* CONTENT */}
                <div className="p-4 flex flex-col gap-2">
                  {/* CATEGORY */}
                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                    {product.category?.name}
                  </span>

                  {/* TITLE */}
                  <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[var(--color-primary)] transition">
                    {product.name}
                  </h3>

                  {/* RATING */}
                  <ProductRating
                    rating={product.averageRating}
                    count={product.reviewCount}
                  />

                  {/* PRICE */}
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-lg font-bold text-[var(--color-primary)]">
                      ₦{product.price.toLocaleString()}
                    </p>
                  </div>

                  {/* ADD TO CART */}
                  <button className="mt-3 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
                    <FiShoppingCart size={14} />
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {loadingMore && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Loading more products...
        </p>
      )}

      {/*Load more button*/}
      {hasMore && (
        <div className="flex justify-center mt-10">
          <button
            onClick={() => loadProducts(page + 1)}
            disabled={loadingMore}
            className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition"
          >
            {loadingMore ? "Loading..." : "Load More"}
          </button>
        </div>
      )}

      <QuickViewModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
