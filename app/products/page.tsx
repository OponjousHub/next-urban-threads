"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FiShoppingCart, FiEye } from "react-icons/fi";
import { cloudinaryImage } from "@/utils/cloudinary-url";
import { ProductRating } from "@/utils/product-rating";
import { ProductSkeleton } from "@/components/products/productSkeleton";
import QuickViewModal from "@/components/products/quickViewModal";
import { useTenant } from "@/store/tenant-provider-context";
import ProductCard from "@/components/products/product-card";

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
  vendor?: {
    id: string;
    storeName: string;
  };
};

export default function AllProductsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const { tenant } = useTenant();

  const isMultiVendor = tenant.storeMode === "MULTI_VENDOR";

  const isSingleVendor = tenant.storeMode === "SINGLE_VENDOR";

  /* Dynamic grid */
  const gridClass = isSingleVendor
    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  const category = searchParams.get("category");
  const featured = searchParams.get("featured");
  const flash = searchParams.get("flash");
  const searchQuery = searchParams.get("search");
  const pageParam = Number(searchParams.get("page") || "1");

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [loadingProducts, setLoadingProducts] = useState(true);

  const [loadingCategories, setLoadingCategories] = useState(true);

  const [search, setSearch] = useState("");

  const [page, setPage] = useState(pageParam);

  const [hasMore, setHasMore] = useState(true);

  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [suggestions, setSuggestions] = useState<Product[]>([]);

  /* FETCH PRODUCTS */

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

      const res = await fetch(`/api/products?${params}`);

      const data = await res.json();

      setProducts((prev) =>
        replace ? data.products : [...prev, ...data.products],
      );

      setHasMore(nextPage < data.totalPages);

      setPage(nextPage);
    } finally {
      setLoadingProducts(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadProducts(1, true);
  }, [
    category,
    featured,
    flash,
    searchQuery,
    tenant.storeMode, // 🔥 reacts immediately
  ]);

  /* CATEGORIES */

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");

        const data = await res.json();

        setCategories(data);
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  /* SEARCH SUGGESTIONS */

  useEffect(() => {
    if (!search.trim()) {
      setSuggestions([]);
      return;
    }

    const delay = setTimeout(async () => {
      const res = await fetch(`/api/products?search=${search}&limit=5`);

      const data = await res.json();

      setSuggestions(data.products || []);
    }, 300);

    return () => clearTimeout(delay);
  }, [search]);

  if (loadingProducts || loadingCategories) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({
          length: 8,
        }).map((_, i) => (
          <ProductSkeleton key={i} />
        ))}
      </div>
    );
  }

  const getTitle = () => {
    if (flash === "true") return "⚡ Flash Deals";

    if (featured === "true") return "Featured Products";

    if (category) {
      const cat = categories.find((c) => c.slug === category);

      return cat ? `${cat.name} Products` : "Products";
    }

    return isMultiVendor ? "Marketplace Products" : "All Products";
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight mb-2">
            {getTitle()}
          </h1>

          <p className="text-sm text-gray-500">
            Showing {products.length} products
          </p>
        </div>

        {/* Category Filters */}
        <div className="hidden md:flex flex-wrap gap-2">
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

          <button
            onClick={() => router.push("/products")}
            className={`px-4 py-2 rounded-full font-medium transition ${
              !category && !featured && !flash && !searchQuery
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            All
          </button>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-gray-500 text-center mt-20">No products found.</p>
      ) : (
        <div
          className={`grid ${gridClass} gap-6 hover:-translate-y-1 transition-all duration-300`}
        >
          {" "}
          {products.map((product) => {
            const imageUrl =
              product.images?.length > 0
                ? cloudinaryImage(product.images[0], "card")
                : "/placeholder.png";

            return (
              <ProductCard
                key={product.id}
                product={product}
                imageUrl={imageUrl}
                setSelectedProduct={setSelectedProduct}
              />
              // <div
              //   key={product.id}
              //   className="group bg-white rounded-2xl overflow-hidden border hover:shadow-xl transition-all duration-300"
              // >
              //   {/* IMAGE */}
              //   <div className="relative w-full h-56 overflow-hidden">
              //     <Image
              //       src={imageUrl}
              //       alt={product.name}
              //       fill
              //       className="object-cover group-hover:scale-105 transition-transform duration-500"
              //     />

              //     {/* HOVER ACTIONS */}
              //     <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition">
              //       <button
              //         onClick={() => setSelectedProduct(product)}
              //         className="bg-white p-2 rounded-full shadow hover:bg-gray-100"
              //         aria-label="Quick View"
              //       >
              //         <FiEye size={16} />
              //       </button>
              //     </div>

              //     {/* BADGE */}
              //     {flash === "true" && (
              //       <span className="absolute top-3 left-3 bg-red-500 text-white text-xs px-3 py-1 rounded-full shadow">
              //         Sale
              //       </span>
              //     )}
              //   </div>

              //   <div className="p-4 flex flex-col gap-2">
              //     <span className="text-xs text-gray-400 uppercase tracking-wide">
              //       {product.category?.name}
              //     </span>

              //     <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 group-hover:text-[var(--color-primary)] transition">
              //       {product.name}
              //     </h3>

              //     {/* ONLY FOR MULTI-VENDOR */}

              //     {isMultiVendor && product.vendor && (
              //       <p className="text-xs text-gray-500">
              //         Sold by{" "}
              //         <span className="font-medium">
              //           {product.vendor.storeName}
              //         </span>
              //       </p>
              //     )}

              //     <ProductRating
              //       rating={product.averageRating}
              //       count={product.reviewCount}
              //     />

              //     <div className="flex items-center justify-between mt-1">
              //       <p className="text-lg font-bold text-[var(--color-primary)]">
              //         {tenant.currency}

              //         {product.price.toLocaleString()}
              //       </p>
              //     </div>

              //     <Link href={`/products/details/${product.id}`}>
              //       <button className="mt-3 w-full bg-black text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition flex items-center justify-center gap-2">
              //         <FiShoppingCart size={14} />
              //         View Product
              //       </button>
              //     </Link>
              //   </div>
              // </div>
            );
          })}
        </div>
      )}

      {loadingMore && (
        <p className="text-center text-sm text-gray-500 mt-4">
          Loading more products...
        </p>
      )}

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
