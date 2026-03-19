import Link from "next/link";

export default function Header() {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold">Products</h1>
        <p className="text-sm text-gray-500">
          Manage your inventory and product listings
        </p>
      </div>

      <div className="flex items-center gap-3">
        <input
          placeholder="Search products..."
          className="border rounded-lg px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-black/10"
        />

        <Link href="/admin/products/new">
          <button className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:opacity-90">
            + Add Product
          </button>
        </Link>
      </div>
    </div>
  );
}
