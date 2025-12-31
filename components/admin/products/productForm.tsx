"use client";

import { useState } from "react";
import { ProductImageUploader } from "./productImageUploader";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["MEN", "WOMEN", "OTHER"];

export function ProductForm() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "MEN",
    subCategory: "",
    sizes: [] as string[],
    inStock: true,
    featured: false,
  });

  function toggleSize(size: string) {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!images.length) {
      alert("Please upload at least one image");
      return;
    }

    setLoading(true);

    const payload = {
      ...form,
      price: Number(form.price),
      images,
    };

    console.log("SUBMIT PRODUCT:", payload);

    // TODO: POST to /api/admin/products
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-sm p-8">
          {/* HEADER */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Create New Product</h1>
            <p className="text-sm text-gray-500">
              Add a new product to the Urban Threads store
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
            {/* PRODUCT NAME + PRICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <input
                  required
                  className="input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Price</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="input"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CATEGORY */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  className="input"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* SUB CATEGORY */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Sub Category
                </label>
                <input
                  className="input"
                  placeholder="e.g. T-Shirt, Dress"
                  value={form.subCategory}
                  onChange={(e) =>
                    setForm({ ...form, subCategory: e.target.value })
                  }
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                rows={4}
                className="input"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            {/* SIZES */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Sizes
              </label>
              <div className="flex gap-3 flex-wrap">
                {SIZES.map((size) => {
                  const active = form.sizes.includes(size);
                  return (
                    <button
                      type="button"
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`px-4 py-2 rounded-md border text-sm transition
            ${
              active
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-300 hover:border-indigo-400"
            }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* IMAGES */}
            <ProductImageUploader
              onUploadComplete={(uploadedImages) => setImages(uploadedImages)}
            />

            {/* FLAGS */}
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) =>
                    setForm({ ...form, inStock: e.target.checked })
                  }
                />
                In Stock
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.featured}
                  onChange={(e) =>
                    setForm({ ...form, featured: e.target.checked })
                  }
                />
                Featured
              </label>
            </div>

            {/* SUBMIT */}
            <div className="pt-6 border-t">
              <button
                disabled={loading}
                className="bg-indigo-600 text-white px-6 py-3 rounded-md
               hover:bg-indigo-700 transition disabled:opacity-60"
              >
                {loading ? "Saving..." : "Save Product"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
