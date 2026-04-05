"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

export function ProductSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") || "");
  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query) {
        params.set("q", query);
      } else {
        params.delete("q");
      }

      router.push(`/admin/products?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // Clear field button
  function clearSearch() {
    setQuery("");
    router.push("/admin/products");
  }

  return (
    <form className="flex gap-2">
      <input
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input w-[100%] md:w-[40%] focus:ring-[var(--color-primary-ring)]"
      />

      {/* Add clear field button */}
      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="flex items-center justify-center w-8 h-8 rounded-full 
               hover:bg-gray-200 transition"
        >
          <FiX size={18} className="text-gray-600 hover:text-red-500" />
        </button>
      )}
    </form>
  );
}
