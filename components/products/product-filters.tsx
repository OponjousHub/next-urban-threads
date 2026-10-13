"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type ProductFiltersProps = {
  basePath?: string;
};

export function ProductFilters({
  basePath = "/admin/products",
}: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    let active = true;

    async function loadCategories() {
      try {
        const response = await fetch("/api/category");

        if (!response.ok) return;

        const data = await response.json();

        if (active && Array.isArray(data)) {
          setCategories(data);
        }
      } catch (error) {
        console.error("Failed to load product filter categories:", error);
      }
    }

    loadCategories();

    return () => {
      active = false;
    };
  }, []);

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.delete("page");

    router.push(`${basePath}?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    params.delete("category");
    params.delete("stock");
    params.delete("featured");
    params.delete("page");

    const query = params.toString();

    router.push(query ? `${basePath}?${query}` : basePath);
  };

  const hasFilters = Boolean(
    searchParams.get("category") ||
    searchParams.get("stock") ||
    searchParams.get("featured"),
  );

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <div className="mr-1 flex items-center gap-2 text-sm font-medium text-gray-700">
          <svg
            className="h-4 w-4 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4h18M6 10h12M10 16h4"
            />
          </svg>
          Filters
        </div>

        <select
          aria-label="Filter by category"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
          onChange={(e) => updateParam("category", e.target.value)}
          value={searchParams.get("category") || ""}
        >
          <option value="">All Categories</option>

          {categories.map((category) => (
            <option key={category.id} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by stock"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
          onChange={(e) => updateParam("stock", e.target.value)}
          value={searchParams.get("stock") || ""}
        >
          <option value="">All Stock</option>
          <option value="low">Low Stock</option>
          <option value="out">Out of Stock</option>
        </select>

        <select
          aria-label="Filter by featured status"
          className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 shadow-sm outline-none transition hover:border-gray-300 focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
          onChange={(e) => updateParam("featured", e.target.value)}
          value={searchParams.get("featured") || ""}
        >
          <option value="">All Products</option>
          <option value="true">Featured</option>
          <option value="false">Not Featured</option>
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="h-9 rounded-lg px-3 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
          >
            Clear
          </button>
        )}
      </div>

      {hasFilters && (
        <div className="text-xs text-gray-400">Filters applied</div>
      )}
    </div>
  );
}
