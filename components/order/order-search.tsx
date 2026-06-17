"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { FiX } from "react-icons/fi";

type OrderSearchProps = {
  basePath: string;
};

export default function OrderSearch({ basePath }: OrderSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("query") || "");

  useEffect(() => {
    const delay = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set("query", query);
      } else {
        params.delete("query");
      }

      params.delete("page"); // reset pagination

      router.push(`${basePath}?${params.toString()}`);
    }, 400);

    return () => clearTimeout(delay);
  }, [query]);

  function clearSearch() {
    setQuery("");

    const params = new URLSearchParams(searchParams.toString());

    params.delete("query");
    params.delete("page");

    router.push(`${basePath}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2">
      <input
        placeholder="Search orders..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="
          px-3 py-2
          border border-gray-300
          rounded-lg shadow-sm
          text-sm
          w-full md:w-72
          bg-gray-50
          focus:outline-none
          focus:ring-1
          focus:ring-[var(--color-primary-ring)]
        "
      />

      {query && (
        <button
          type="button"
          onClick={clearSearch}
          className="
            flex items-center justify-center
            w-8 h-8
            rounded-full
            hover:bg-gray-200
            transition
          "
        >
          <FiX size={18} className="text-gray-600 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}
