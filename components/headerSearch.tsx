"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

type Product = {
  id: string;
  name: string;
  images: string[];
};

export default function HeaderSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------- FETCH (DEBOUNCED) ---------------- */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/products?search=${encodeURIComponent(query)}`,
        );
        const data = await res.json();

        setResults(data.products || []);
        setOpen(true);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300); // debounce delay

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* ---------------- CLOSE ON OUTSIDE CLICK ---------------- */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setOpen(false);
    router.push(`/products?search=${encodeURIComponent(query)}`);
  };

  /* ---------------- CLICK RESULT ---------------- */
  const handleSelect = (id: string) => {
    setOpen(false);
    router.push(`/products/details/${id}`);
  };

  /* ---------------- HIGHLIGHT MATCH ---------------- */
  const highlight = (text: string) => {
    const parts = text.split(new RegExp(`(${query})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={i} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      ),
    );
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      {/* INPUT */}
      <form
        onSubmit={handleSubmit}
        className="hidden md:flex items-center gap-2 border border-gray-300 rounded-full px-4 py-2 bg-white shadow-sm hover:shadow-md transition focus-within:ring-2 focus-within:ring-[var(--color-primary)] duration-300 focus-within:w-[260px]"
      >
        <input
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent"
        />

        <button type="submit" className="text-sm text-gray-600">
          Search
        </button>
      </form>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute top-full left-0 w-full bg-white border mt-2 rounded-xl shadow-lg z-[2000] max-h-80 overflow-y-auto">
          {loading ? (
            <p className="p-3 text-sm text-gray-500">Searching...</p>
          ) : results.length === 0 ? (
            <p className="p-3 text-sm text-gray-500">No results</p>
          ) : (
            <>
              {results.slice(0, 6).map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                >
                  <img
                    src={product.images?.[0] || "/placeholder.png"}
                    className="w-10 h-10 object-cover rounded"
                  />

                  <p className="text-sm">{highlight(product.name)}</p>
                </div>
              ))}

              {/* VIEW ALL */}
              <button
                onClick={handleSubmit}
                className="w-full text-left p-3 text-sm font-medium border-t hover:bg-gray-50"
              >
                View all results →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
