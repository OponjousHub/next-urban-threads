import Link from "next/link";
import { ProductSearch } from "@/components/admin/products/product-search";
import { ProductFilters } from "@/components/admin/products/product-filters";
import ProductSorting from "@/components/admin/products/product-sorting";

export default function Header() {
  return (
    <div className="sticky top-0 z-30 bg-white border-b px-4 py-3 space-y-4">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold">Products</h1>
          <p className="hidden lg:block text-sm text-gray-500">
            Manage your inventory and product listings
          </p>
        </div>

        <Link href="/admin/products/new">
          <button className="bg-black text-white px-3 py-2 lg:px-4 rounded-lg text-sm hover:opacity-90">
            + Add
          </button>
        </Link>
      </div>

      {/* Search row */}
      <div className="w-full">
        <ProductSearch />
      </div>

      {/* Filters + Sort */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <ProductFilters />
        <div className="flex flex-col text-xs text-gray-500">
          <span>Sort</span>
          <ProductSorting />
        </div>
      </div>
    </div>
  );
}
