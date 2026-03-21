import Link from "next/link";
import { ProductSearch } from "@/components/admin/products/product-search";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-gray-500">
          Manage your inventory and product listings
        </p>
      </div>

      <div className="flex items-center gap-10">
        <ProductSearch />

        <Link href="/admin/products/new">
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            + Add Product
          </button>
        </Link>
      </div>
    </div>
  );
}
