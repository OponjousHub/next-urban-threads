"use client";

import { useState } from "react";
import { ProductImageUploader } from "./productImageUploader";
import toast from "react-hot-toast";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["MEN", "WOMEN", "ASSECCORIES"];
const COLOURS = [
  "Black",
  "White",
  "Red",
  "Blue",
  "Green",
  "Yellow",
  "Brown",
  "Grey",
  "Pink",
  "Purple",
];
type ZodFieldErrors = {
  fieldErrors?: Record<string, string[]>;
};

export function ProductForm() {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "MEN",
    subCategory: "",
    sizes: [] as string[],
    colours: [] as string[],
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

  function toggleColour(colour: string) {
    setForm((prev) => ({
      ...prev,
      colours: prev.colours.includes(colour)
        ? prev.colours.filter((c) => c !== colour)
        : [...prev.colours, colour],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!images.length) {
      alert("Please upload at least one image");
      return;
    }
    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images, // array of cloudinary URLs
      };

      console.log("SUBMIT PRODUCT:", payload);

      const response = await fetch("/api/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      // console.log("STATUS:", response.status);
      // console.log("HEADERS:", response.headers.get("content-type"));

      const data = await response.json();
      if (!response.ok) {
        console.error("Backend Error:", data);
        // Zod validation errors
        if (data?.errors?.fieldErrors) {
          const fieldErrors = (data.errors as ZodFieldErrors)?.fieldErrors;
          const firstError = fieldErrors
            ? Object.values(fieldErrors)[0]?.[0]
            : undefined;
          toast.error(firstError || "Invalid product data");
        } else {
          toast.error(data?.message || "Failed to create product");
        }

        return;
      }

      // ✅ SUCCESS
      toast.success("Product created successfully 🎉");
      console.log("Created Product:", data);

      // Optional: reset form
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "MEN",
        subCategory: "",
        sizes: [],

        featured: false,
      });
      setImages([]);
    } catch (err) {
      console.error("FETCH ERROR:", err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
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
          <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
            {/* PRODUCT NAME*/}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
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
            </div>
            {/* STOCK + PRICE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stock Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  className="input"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
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

            {/* COLOURS */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Available Colours
              </label>

              <div className="flex gap-3 flex-wrap">
                {COLOURS.map((colour) => {
                  const active = form.colours.includes(colour);

                  return (
                    <button
                      type="button"
                      key={colour}
                      onClick={() => toggleColour(colour)}
                      className={`px-4 py-2 rounded-md border text-sm transition
            ${
              active
                ? "bg-indigo-600 text-white border-indigo-600"
                : "border-gray-300 hover:border-indigo-400"
            }`}
                    >
                      {colour}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-500 mt-1">
                Select all available colour options
              </p>
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
                type="submit"
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
