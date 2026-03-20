"use client";

import { useRouter } from "next/navigation";

export default function ProductDetails({ product }: { product: any }) {
  const router = useRouter();

  const stockStatus =
    product.stock === 0 ? "out" : product.stock <= 5 ? "low" : "ok";

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold">{product.name}</h1>
          <p className="text-sm text-gray-500">Product ID: {product.id}</p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/products/${product.id}/edit`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Edit
          </button>

          <button className="px-4 py-2 bg-red-600 text-white rounded-md">
            Delete
          </button>
        </div>
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* IMAGES */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Images</h2>

            <div className="flex gap-4 flex-wrap">
              {product.images?.map((img: string, i: number) => (
                <img
                  key={i}
                  src={img}
                  className="w-32 h-32 object-cover rounded-lg border"
                />
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Description</h2>
            <p className="text-gray-600 whitespace-pre-line">
              {product.description || "No description"}
            </p>
          </div>

          {/* VARIANTS */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h2 className="font-semibold mb-4">Variants</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500">Sizes</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {product.sizes?.map((s: string) => (
                  <span
                    key={s}
                    className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Colours</p>
              <div className="flex gap-2 mt-2 flex-wrap">
                {product.colours?.map((c: string) => (
                  <span
                    key={c}
                    className="px-3 py-1 bg-gray-100 rounded-md text-sm"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="space-y-6">
          {/* PRICE */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Pricing</h3>
            <p className="text-xl font-bold">
              ₦{product.price.toLocaleString()}
            </p>
          </div>

          {/* STOCK */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Inventory</h3>

            <span
              className={`px-3 py-1 text-sm rounded-full ${
                stockStatus === "out"
                  ? "bg-red-100 text-red-600"
                  : stockStatus === "low"
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
              }`}
            >
              {product.stock === 0
                ? "Out of stock"
                : product.stock <= 5
                  ? `Low (${product.stock})`
                  : `${product.stock} in stock`}
            </span>
          </div>

          {/* META */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-semibold mb-4">Details</h3>

            <div className="space-y-2 text-sm">
              <p>
                <span className="text-gray-500">Category:</span>{" "}
                {product.category}
              </p>
              <p>
                <span className="text-gray-500">Sub Category:</span>{" "}
                {product.subCategory || "-"}
              </p>
              <p>
                <span className="text-gray-500">Featured:</span>{" "}
                {product.featured ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
