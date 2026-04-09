"use client";

import { useState, useEffect } from "react";
import { ProductImageUploader } from "./productImageUploader";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import Link from "next/link";
import { useRouter } from "next/navigation";

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

type ProductFormProps = {
  initialData?: any;
};

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  subCategory: string;
  sizes: string[];
  colours: string[];
  featured: boolean;
  flash: boolean;
};

type Category = {
  id: string;
  name: string;
  // slug     String   @unique
  // image    String?
  // tenantId String
  // // products  Product[]
  // tenant   Tenant  @relation(fields: [tenantId], references: [id])
  // isFeatured Boolean @default(true)
};

function Section({ title, children }: any) {
  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <h2 className="font-semibold mb-4">{title}</h2>
      {children}
    </div>
  );
}

export function ProductForm({ initialData }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [categories, setCategories] = useState<Category[]>([]);

  // ✅ Initialize form state from initialData
  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    subCategory: "",
    sizes: [],
    colours: [],
    featured: false,
    flash: false,
  });

  const [images, setImages] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);

  console.log("CCCCCCCCCCCCCCCC", form.category);

  // FETCH CATEGORIES
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories");
      }
    }

    loadCategories();
  }, []);

  // Fill the form and images from initialData if editing
  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || "",
        description: initialData.description || "",
        price: initialData.price?.toString() || "",
        stock: initialData.stock?.toString() || "",
        category: initialData.categoryId || "",
        subCategory: initialData.subCategory || "",
        sizes: initialData.sizes || [],
        colours: initialData.colours || [],
        featured: initialData.featured || false,
        flash: initialData.flash || false,
      });
      setImages(initialData.images || []);
    }
  }, [initialData]);

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
      // if (isEdit) {
      //   console.log("EDIT ID", initialData.id);
      // }
      console.log("PAYLOAD", payload);

      const response = await fetch(
        isEdit ? `/api/admin/products/${initialData.id}` : "/api/products",
        {
          method: isEdit ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        },
      );

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
              description={data?.message || "Failed to save product"}
            />,
            { duration: 6000 },
          );
        }
        return;
      }

      toast.custom(
        <AdminToast
          type="success"
          title={isEdit ? "Product updated" : "Product created"}
          description="Your product is now live in the store"
        />,
        { duration: 6000 },
      );

      // reset form if creating
      if (!isEdit) {
        setForm({
          name: "",
          description: "",
          price: "",
          stock: "",
          category: "",
          subCategory: "",
          sizes: [],
          colours: [],
          featured: false,
          flash: false,
        });
        setImages([]);
      } else {
        router.push("/admin/products");
      }
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
          <h1 className="text-2xl font-semibold">
            {isEdit ? "Edit Product" : "Create Product"}
          </h1>
          <p className="text-sm text-gray-500">
            {isEdit
              ? "Update your product details"
              : "Add a new product to your store"}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT SIDE */}
            <div className="lg:col-span-2 space-y-8">
              <Section title="Basic Information">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Product Name
                    </label>
                    <input
                      required
                      placeholder="Enter product name"
                      className="input focus:ring-[var(--color-primary-ring)]"
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
                      className="input focus:ring-[var(--color-primary-ring)]"
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Section>

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
                      className="input focus:ring-[var(--color-primary-ring)]"
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
                      className="input focus:ring-[var(--color-primary-ring)]"
                      value={form.stock}
                      onChange={(e) =>
                        setForm({ ...form, stock: e.target.value })
                      }
                    />
                  </div>
                </div>
              </Section>

              <Section title="Organization">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="">Select Category</option>

                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <input
                    className="input focus:ring-[var(--color-primary-ring)]"
                    placeholder="Sub category (e.g. T-Shirt)"
                    value={form.subCategory}
                    onChange={(e) =>
                      setForm({ ...form, subCategory: e.target.value })
                    }
                  />
                </div>
              </Section>

              <Section title="Variants">
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
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                              : "border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>

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
                              ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
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

              <Section title="Product Images">
                <ProductImageUploader
                  onUploadComplete={(imgs) => setImages(imgs)}
                  initialImages={images}
                />
              </Section>

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
                  className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-md hover:bg-[var(--color-primary-dark)]"
                >
                  {loading
                    ? isEdit
                      ? "Updating..."
                      : "Saving..."
                    : isEdit
                      ? "Update Product"
                      : "Save Product"}
                </button>
              </div>
            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">
              <div className="border rounded-2xl p-6 bg-white shadow-sm ">
                <h3 className="font-semibold mb-4">Status</h3>
                <div className="flex flex-col gap-4">
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
                  <label className="flex items-center justify-between">
                    <span>Flash Product</span>
                    <input
                      type="checkbox"
                      checked={form.flash}
                      onChange={(e) =>
                        setForm({ ...form, flash: e.target.checked })
                      }
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
