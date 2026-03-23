"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSorting() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <select
      className="border rounded-lg px-3 py-2 text-sm"
      value={currentSort}
      onChange={(e) => updateParam("sort", e.target.value)}
    >
      <option value="">Default</option>
      <option value="newest">Newest</option>
      <option value="price_asc">Price (Low → High)</option>
      <option value="price_desc">Price (High → Low)</option>
      <option value="stock">Stock</option>
    </select>
  );
}
