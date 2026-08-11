"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function ProductSort() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort") || "newest";

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }

    // Sorting should always return to page 1
    params.delete("page");

    const query = params.toString();

    router.push(query ? `/admin/products?${query}` : "/admin/products");
  };

  return (
    <div className="flex items-end gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="product-sort"
          className="text-xs font-medium text-gray-500"
        >
          Sort by
        </label>

        <select
          id="product-sort"
          value={currentSort}
          onChange={(e) => handleSortChange(e.target.value)}
          className="
            h-10
            min-w-[180px]
            cursor-pointer
            rounded-xl
            border
            border-gray-200
            bg-white
            px-3
            text-sm
            font-medium
            text-gray-700
            shadow-sm
            outline-none
            transition
            hover:border-gray-300
            focus:border-[var(--color-primary)]
            focus:ring-2
            focus:ring-[var(--color-primary-ring)]
          "
        >
          <option value="newest">Newest first</option>

          <option value="oldest">Oldest first</option>

          <option value="name_asc">Name: A → Z</option>

          <option value="name_desc">Name: Z → A</option>

          <option value="price_asc">Price: Low → High</option>

          <option value="price_desc">Price: High → Low</option>

          <option value="stock">Stock: Low → High</option>
        </select>
      </div>
    </div>
  );
}
