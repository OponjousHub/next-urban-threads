"use client";

import { useState } from "react";
import { ProductImageUploader } from "./productImageUploader";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import Link from "next/link";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const CATEGORIES = ["MEN", "WOMEN", "ACCESSORIES"];
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

function Section({ title, children }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

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
      toast.error("Please upload at least one image");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        images,
      };

      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.errors?.fieldErrors) {
          const fieldErrors = (data.errors as ZodFieldErrors)?.fieldErrors;
          const firstError = fieldErrors
            ? Object.values(fieldErrors)[0]?.[0]
            : undefined;

          toast.custom(
            <AdminToast
              type="error"
              title="Upload failed!"
              description={firstError || "Invalid product data"}
            />,
            { duration: 6000 },
          );
        } else {
          toast.custom(
            <AdminToast
              type="error"
              title="Upload failed!"
              description={data?.message || "Failed to create product"}
            />,
            { duration: 6000 },
          );
        }
        return;
      }

      toast.custom(
        <AdminToast
          type="success"
          title="Product created"
          description="Your product is now live in the store"
        />,
        { duration: 6000 },
      );

      // reset
      setForm({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "MEN",
        subCategory: "",
        sizes: [],
        colours: [],
        featured: false,
      });
      setImages([]);
    } catch (err) {
      toast.custom(
        <AdminToast
          type="error"
          title="Upload failed!"
          description="Something went wrong. Please try again."
        />,
        { duration: 6000 },
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold">Create New Product</h1>
          <p className="text-sm text-gray-500">
            Add a new product to your store
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-8">
              {/* BASIC INFO */}
              <Section title="Basic Information">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name
                    </label>
                    <input
                      required
                      placeholder="Enter product name"
                      className="input"
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      className="input"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Section>

              {/* PRICING */}
              <Section title="Pricing & Inventory">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      min="0"
                      inputMode="numeric"
                      required
                      className="input"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stock Quantity
                    </label>
                    <input
                      type="number"
                      min={0}
                      inputMode="numeric"
                      required
                      className="input"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Section>

              {/* CATEGORY */}
              <Section title="Organization">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    className="input"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat}>{cat}</option>
                    ))}
                  </select>

                  <input
                    className="input"
                    placeholder="Sub category (e.g. T-Shirt)"
                    value={form.subCategory}
                    onChange={(e) =>
                      setForm({ ...form, subCategory: e.target.value })
                    }
                  />
                </div>
              </Section>

              {/* VARIANTS */}
              <Section title="Variants">
                {/* Sizes */}
                <div className="mb-6">
                  <p className="text-sm font-medium mb-2">Sizes</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES.map((size) => {
                      const active = form.sizes.includes(size);
                      return (
                        <button
                          type="button"
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`px-3 py-1 rounded-md border text-sm ${
                            active
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Colours */}
                <div>
                  <p className="text-sm font-medium mb-2">Colours</p>
                  <div className="flex flex-wrap gap-2">
                    {COLOURS.map((colour) => {
                      const active = form.colours.includes(colour);
                      return (
                        <button
                          type="button"
                          key={colour}
                          onClick={() => toggleColour(colour)}
                          className={`px-3 py-1 rounded-md border text-sm ${
                            active
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "border-gray-300"
                          }`}
                        >
                          {colour}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </Section>

              {/* IMAGES */}
              <Section title="Product Images">
                <ProductImageUploader
                  onUploadComplete={(imgs) => setImages(imgs)}
                />
              </Section>

              {/* ACTIONS */}
              <div className="flex justify-between items-center pt-6 border-t">
                <Link href={"/admin/products"}>
                  <button
                    type="button"
                    className="text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition"
                  >
                    Cancel
                  </button>
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                >
                  {loading ? "Saving..." : "Save Product"}
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              <div className="border rounded-2xl p-6 bg-white shadow-sm">
                <h3 className="font-semibold mb-4">Status</h3>

                <label className="flex items-center justify-between">
                  <span>Featured Product</span>
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) =>
                      setForm({ ...form, featured: e.target.checked })
                    }
                  />
                </label>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
