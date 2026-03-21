"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

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

  return (
    <form className="flex gap-2">
      <input
        placeholder="Search products..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="input w-64"
      />
    </form>
  );
}
