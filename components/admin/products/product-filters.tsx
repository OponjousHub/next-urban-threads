"use client";

import { useRouter, useSearchParams } from "next/navigation";

export function ProductFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set(key, value);
    else params.delete(key);

    router.push(`/admin/products?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {" "}
      {/* Category */}
      <div className="h-6 w-px bg-gray-300 mx-2" />
      <select
        className="input w-auto min-w-[140px] text-sm"
        onChange={(e) => updateParam("category", e.target.value)}
        defaultValue={searchParams.get("category") || ""}
      >
        <option value="">Categories</option>
        <option value="MEN">Men</option>
        <option value="WOMEN">Women</option>
        <option value="ACCESSORIES">Accessories</option>
      </select>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      {/* Stock */}
      <select
        className="input w-auto min-w-[140px]"
        onChange={(e) => updateParam("stock", e.target.value)}
        defaultValue={searchParams.get("stock") || ""}
      >
        <option value="">All Stock</option>
        <option value="low">Low Stock</option>
        <option value="out">Out of Stock</option>
      </select>
      <div className="h-6 w-px bg-gray-300 mx-2" />
      {/* Featured */}
      <select
        className="input w-auto min-w-[140px]"
        onChange={(e) => updateParam("featured", e.target.value)}
        defaultValue={searchParams.get("featured") || ""}
      >
        <option value="">All</option>
        <option value="true">Featured</option>
        <option value="false">Not Featured</option>
      </select>
      <div className="h-6 w-px bg-gray-300 mx-2" />
    </div>
  );
}
