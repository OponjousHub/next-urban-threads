"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

type ProductSearchProps = {
  basePath: string;
};

export default function ProductSearch({ basePath }: ProductSearchProps) {
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

      router.push(`${basePath}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  // Clear field button
  function clearSearch() {
    setQuery("");
    router.push(basePath);
  }

  return (
    <form className="flex gap-2">
      <div className="relative w-full">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search products..."
          className="
    h-11
    w-full
    rounded-xl
    border
    border-gray-400
    bg-white
    px-4
    pl-11
    text-sm
    text-gray-900
    placeholder:text-gray-400
    shadow-sm
    outline-none
    transition
    focus:border-[var(--color-primary)]
    focus:ring-2
    focus:ring-[var(--color-primary-ring)]
  "
        />
      </div>

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
