"use client";

import { useState, useEffect, useMemo } from "react";
import { ProductImageUploader } from "./productImageUploader";
import { ProductVideoUploader } from "./productVideoUploader";
import toast from "react-hot-toast";
import { appToast } from "@/utils/appToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";
import AdminHeaderUI from "@/components/admin/adminHeaderUI";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

const COLOURS = [
  { name: "Black", hex: "#000000" },
  { name: "White", hex: "#FFFFFF" },
  { name: "Red", hex: "#dc2626" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Green", hex: "#16a34a" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Brown", hex: "#92400e" },
  { name: "Grey", hex: "#6b7280" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#9333ea" },
  { name: "Silver", hex: "#C0C0C0" },
  { name: "Gold", hex: "#D4AF37" },
];

const COLOR_MAP: Record<string, string> = {
  Black: "#000000",
  White: "#FFFFFF",
  Red: "#dc2626",
  Blue: "#2563eb",
  Green: "#16a34a",
  Yellow: "#eab308",
  Brown: "#92400e",
  Grey: "#6b7280",
  Pink: "#ec4899",
  Purple: "#9333ea",
  Silver: "#c0c0c0",
  Gold: "#d4af37",
};

type VariantType = {
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  image?: string;
};

type ProductFormState = {
  name: string;
  description: string;
  basePrice: string;
  stock: string;
  category: string;
  subCategory: string;
  featured: boolean;
  flash: boolean;
};

type Category = {
  id: string;
  name: string;
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border rounded-2xl p-6 bg-white shadow-sm">
      <h2 className="font-semibold mb-6 text-lg">{title}</h2>
      {children}
    </div>
  );
}

type ProductSearchProps = {
  basePath: string;
  initialData?: any;
  admin?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
};

export function ProductForm({
  initialData,
  basePath,
  admin,
}: ProductSearchProps) {
  const router = useRouter();

  const isEdit = !!initialData;

  /* -------------------------------- STATE -------------------------------- */

  const [categories, setCategories] = useState<Category[]>([]);
  const [customSize, setCustomSize] = useState("");

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    basePrice: "",
    stock: "",
    category: "",
    subCategory: "",
    featured: false,
    flash: false,
  });

  const [videos, setVideos] = useState<{ url: string; public_id: string }[]>(
    [],
  );

  const [images, setImages] = useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  const [variants, setVariants] = useState<VariantType[]>([]);

  const [uploadingVariantImage, setUploadingVariantImage] = useState<
    number | null
  >(null);

  /*
   * NEW:
   *
   * false = simple product
   * true  = product with variants
   */
  const [hasVariants, setHasVariants] = useState(false);

  const [loading, setLoading] = useState(false);

  /* -------------------------------- FETCH CATEGORIES -------------------------------- */

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");

        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await res.json();

        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    loadCategories();
  }, []);

  /* -------------------------------- EDIT LOGIC -------------------------------- */

  useEffect(() => {
    if (!initialData) return;

    const existingVariants = Array.isArray(initialData.variants)
      ? initialData.variants
      : [];

    const productHasVariants = existingVariants.length > 0;

    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      basePrice:
        initialData.price !== null && initialData.price !== undefined
          ? initialData.price.toString()
          : "",
      stock:
        initialData.stock !== null && initialData.stock !== undefined
          ? initialData.stock.toString()
          : "",
      category: initialData.categoryId || "",
      subCategory: initialData.subCategory || "",
      featured: initialData.featured || false,
      flash: initialData.isFlashDeal || false,
    });

    setImages(initialData.images || []);

    setVideos(initialData.videos || []);

    setHasVariants(productHasVariants);

    if (productHasVariants) {
      setVariants(existingVariants);

      const uniqueSizes = [
        ...new Set<string>(
          existingVariants.map((v: VariantType) => v.size).filter(Boolean),
        ),
      ];

      const uniqueColours = [
        ...new Set<string>(
          existingVariants.map((v: VariantType) => v.color).filter(Boolean),
        ),
      ];

      setSelectedSizes(uniqueSizes);

      setSelectedColours(uniqueColours);
    } else {
      setVariants([]);
      setSelectedSizes([]);
      setSelectedColours([]);
    }
  }, [initialData]);

  /* -------------------------------- GENERATE VARIANTS -------------------------------- */

  useEffect(() => {
    /*
     * Simple products do not need variants.
     */
    if (!hasVariants) {
      setVariants([]);
      return;
    }

    setVariants((prev) => {
      const generated: VariantType[] = [];

      for (const color of selectedColours) {
        for (const size of selectedSizes) {
          const existing = prev.find(
            (variant) => variant.color === color && variant.size === size,
          );

          if (existing) {
            generated.push(existing);
          } else {
            generated.push({
              color,
              size,
              colorHex: COLOR_MAP[color] || "#000000",
              stock: 0,
              price: Number(form.basePrice) || 0,
              image: "",
            });
          }
        }
      }

      return generated;
    });
  }, [hasVariants, selectedColours, selectedSizes, form.basePrice]);

  /* -------------------------------- VARIANT MODE TOGGLE -------------------------------- */

  function handleVariantToggle(enabled: boolean) {
    setHasVariants(enabled);

    /*
     * When switching to simple-product mode,
     * variant-specific data is removed from the
     * product payload.
     */
    if (!enabled) {
      setVariants([]);
      setSelectedSizes([]);
      setSelectedColours([]);
    }
  }

  /* -------------------------------- SIZE TOGGLE -------------------------------- */

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  /* -------------------------------- COLOUR TOGGLE -------------------------------- */

  function toggleColour(colour: string) {
    setSelectedColours((prev) =>
      prev.includes(colour)
        ? prev.filter((c) => c !== colour)
        : [...prev, colour],
    );
  }

  /* -------------------------------- TOTAL STOCK -------------------------------- */

  const totalStock = useMemo(() => {
    if (!hasVariants) {
      return Number(form.stock) || 0;
    }

    return variants.reduce((acc, item) => acc + (Number(item.stock) || 0), 0);
  }, [hasVariants, form.stock, variants]);

  /* -------------------------------- UPDATE VARIANT -------------------------------- */

  function updateVariant(index: number, key: keyof VariantType, value: any) {
    setVariants((prev) =>
      prev.map((variant, i) =>
        i === index
          ? {
              ...variant,
              [key]: value,
            }
          : variant,
      ),
    );
  }

  /* -------------------------------- CUSTOM SIZE -------------------------------- */

  function addCustomSize() {
    const value = customSize.trim();

    if (!value) return;

    if (selectedSizes.includes(value)) {
      appToast.warning("Warning", "Size already added");
      return;
    }

    setSelectedSizes((prev) => [...prev, value]);

    setCustomSize("");
  }

  /* -------------------------------- SUBMIT -------------------------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    /* -------------------------------- VALIDATION -------------------------------- */

    if (!form.name.trim()) {
      appToast.warning("Product name required", "Please enter a product name.");

      return;
    }

    if (!form.basePrice || Number(form.basePrice) < 0) {
      appToast.warning("Price required", "Please enter a valid product price.");

      return;
    }

    if (!images.length) {
      appToast.warning(
        "Images required",
        "Please upload at least one product image.",
      );

      return;
    }

    /*
     * Simple product validation.
     */
    if (!hasVariants) {
      if (form.stock === "" || Number(form.stock) < 0) {
        appToast.warning(
          "Stock required",
          "Please enter the available stock for this product.",
        );

        return;
      }
    }

    /*
     * Variant product validation.
     */
    if (hasVariants) {
      if (!selectedSizes.length) {
        appToast.warning("Size required", "Please select at least one size.");

        return;
      }

      if (!selectedColours.length) {
        appToast.warning(
          "Colour required",
          "Please select at least one colour.",
        );

        return;
      }

      if (!variants.length) {
        appToast.warning(
          "Variants required",
          "Please create at least one product variant.",
        );

        return;
      }
    }

    /* -------------------------------- SAVE -------------------------------- */

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       *
       * Simple product:
       *   stock = manually entered product stock
       *   variants = []
       *
       * Variant product:
       *   stock = calculated total variant stock
       *   variants = generated variants
       */
      const payload = {
        ...form,

        price: Number(form.basePrice),

        stock: hasVariants ? totalStock : Number(form.stock),

        images,

        videos,

        variants: hasVariants ? variants : [],

        /*
         * This makes the product type explicit.
         * Your backend can use this if desired.
         */
        hasVariants,
      };

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
        appToast.error("Failed", data?.message || "Unable to save product.");

        return;
      }

      appToast.success(
        isEdit ? "Product updated" : "Product created",
        isEdit
          ? "Product updated successfully."
          : "Product created successfully.",
      );

      /* -------------------------------- RESET AFTER CREATE -------------------------------- */

      if (!isEdit) {
        setForm({
          name: "",
          description: "",
          basePrice: "",
          stock: "",
          category: "",
          subCategory: "",
          featured: false,
          flash: false,
        });

        setImages([]);

        setVideos([]);

        setSelectedSizes([]);

        setSelectedColours([]);

        setVariants([]);

        setHasVariants(false);

        setCustomSize("");

        /*
         * Stay on the create page after creating a product,
         * just like your original behaviour.
         */
        return;
      }

      /*
       * Edit mode returns to the product list.
       */
      router.push(basePath);
    } catch (err) {
      console.error("Product save error:", err);

      appToast.error("Error", "Something went wrong while saving the product.");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------- RENDER -------------------------------- */

  return (
    <>
      <AdminHeaderUI
        title={`${isEdit ? "Edit" : "Create"} product`}
        subtitle={`${isEdit ? "Edit " : "Create "}inventory, variants and pricing`}
        admin={admin}
      />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid lg:grid-cols-3 gap-8">
              {/* ========================================================= */}
              {/* LEFT */}
              {/* ========================================================= */}

              <div className="lg:col-span-2 space-y-8">
                {/* ===================================================== */}
                {/* BASIC INFORMATION */}
                {/* ===================================================== */}

                <Section title="Basic Information">
                  <div className="space-y-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Product Name
                      </label>

                      <input
                        required
                        className="input"
                        value={form.name}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            name: e.target.value,
                          })
                        }
                        placeholder="e.g. Classic Leather Handbag"
                      />
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Description
                      </label>

                      <textarea
                        rows={5}
                        className="input"
                        value={form.description}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            description: e.target.value,
                          })
                        }
                        placeholder="Describe your product..."
                      />
                    </div>
                  </div>
                </Section>

                {/* ===================================================== */}
                {/* PRICING */}
                {/* ===================================================== */}

                <Section title="Pricing">
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Base Price
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      className="input"
                      value={form.basePrice}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          basePrice: e.target.value,
                        })
                      }
                      placeholder="0.00"
                    />

                    <p className="mt-2 text-xs text-gray-500">
                      This is the default product price. Variant prices can be
                      adjusted individually below when variants are enabled.
                    </p>
                  </div>
                </Section>

                {/* ===================================================== */}
                {/* ORGANIZATION */}
                {/* ===================================================== */}

                <Section title="Organization">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Category
                      </label>

                      <select
                        value={form.category}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            category: e.target.value,
                          })
                        }
                        className="input"
                      >
                        <option value="">Select category</option>

                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        Sub category
                      </label>

                      <input
                        className="input"
                        placeholder="e.g. Handbags"
                        value={form.subCategory}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            subCategory: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </Section>

                {/* ===================================================== */}
                {/* PRODUCT TYPE */}
                {/* ===================================================== */}

                <Section title="Product Options">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          This product has variants
                        </h3>

                        <p className="text-sm text-gray-500 mt-1 max-w-xl">
                          Turn this on when customers need to choose options
                          such as size, colour, or another combination before
                          purchasing.
                        </p>
                      </div>

                      {/* TOGGLE */}

                      <button
                        type="button"
                        role="switch"
                        aria-checked={hasVariants}
                        onClick={() => handleVariantToggle(!hasVariants)}
                        className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 ${
                          hasVariants ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                            hasVariants ? "translate-x-6" : "translate-x-1"
                          }`}
                        />
                      </button>
                    </div>

                    {/* SIMPLE PRODUCT */}

                    {!hasVariants && (
                      <div className="mt-6 border-t border-gray-200 pt-6">
                        <label className="block mb-2 text-sm font-medium">
                          Stock
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="1"
                          required
                          className="input max-w-sm"
                          value={form.stock}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              stock: e.target.value,
                            })
                          }
                          placeholder="0"
                        />

                        <p className="mt-2 text-xs text-gray-500">
                          Enter the total quantity available for this product.
                        </p>
                      </div>
                    )}
                  </div>
                </Section>

                {/* ===================================================== */}
                {/* VARIANT BUILDER */}
                {/* ===================================================== */}

                {hasVariants && (
                  <Section title="Variant Builder">
                    {/* ================================================= */}
                    {/* SIZES */}
                    {/* ================================================= */}

                    <div className="mb-8">
                      <p className="font-medium mb-3">Sizes</p>

                      {/* PRESET SIZES */}

                      <div className="flex flex-wrap gap-2 mb-4">
                        {SIZES.map((size) => {
                          const active = selectedSizes.includes(size);

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSize(size)}
                              className={`px-4 py-2 rounded-xl border transition ${
                                active
                                  ? "bg-black text-white border-black"
                                  : "border-gray-300 bg-white hover:bg-gray-50"
                              }`}
                            >
                              {size}
                            </button>
                          );
                        })}
                      </div>

                      {/* CUSTOM SIZE */}

                      <div className="flex gap-3">
                        <input
                          value={customSize}
                          onChange={(e) => setCustomSize(e.target.value)}
                          placeholder="Add custom size (e.g. 12, 42, XXL)"
                          className="input"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addCustomSize();
                            }
                          }}
                        />

                        <button
                          type="button"
                          onClick={addCustomSize}
                          className="bg-black text-white px-5 rounded-xl hover:bg-gray-800 transition"
                        >
                          Add
                        </button>
                      </div>

                      {/* SELECTED SIZES */}

                      {selectedSizes.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {selectedSizes.map((size) => (
                            <div
                              key={size}
                              className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-xl"
                            >
                              <span>{size}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) =>
                                    prev.filter((s) => s !== size),
                                  )
                                }
                                className="text-red-500 text-sm hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ================================================= */}
                    {/* COLOURS */}
                    {/* ================================================= */}

                    <div>
                      <p className="font-medium mb-3">Colours</p>

                      <div className="flex flex-wrap gap-3">
                        {COLOURS.map((colour) => {
                          const active = selectedColours.includes(colour.name);

                          return (
                            <button
                              key={colour.name}
                              type="button"
                              onClick={() => toggleColour(colour.name)}
                              title={colour.name}
                              aria-label={`Select ${colour.name}`}
                              className={`w-10 h-10 rounded-full border-4 transition ${
                                active
                                  ? "border-black scale-110"
                                  : "border-gray-200 hover:scale-105"
                              }`}
                              style={{
                                backgroundColor: colour.hex,
                              }}
                            />
                          );
                        })}
                      </div>

                      {selectedColours.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {selectedColours.map((colour) => (
                            <span
                              key={colour}
                              className="text-xs bg-gray-100 rounded-full px-3 py-1.5"
                            >
                              {colour}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* ===================================================== */}
                {/* VARIANT TABLE */}
                {/* ===================================================== */}

                {hasVariants && variants.length > 0 && (
                  <Section title="Variant Inventory">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 pr-4">Variant</th>

                            <th className="text-left py-3 pr-4">Price</th>

                            <th className="text-left py-3 pr-4">Stock</th>

                            <th className="text-left py-3">Image</th>
                          </tr>
                        </thead>

                        <tbody>
                          {variants.map((variant, index) => (
                            <tr
                              key={`${variant.color}-${variant.size}-${index}`}
                              className="border-b"
                            >
                              <td className="py-4 pr-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className="w-5 h-5 rounded-full border shrink-0"
                                    style={{
                                      backgroundColor: variant.colorHex,
                                    }}
                                  />

                                  <span className="whitespace-nowrap">
                                    {variant.color} / {variant.size}
                                  </span>
                                </div>
                              </td>

                              <td className="pr-4">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="border rounded-lg px-3 py-2 w-28"
                                  value={variant.price}
                                  onChange={(e) =>
                                    updateVariant(
                                      index,
                                      "price",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td className="pr-4">
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  className="border rounded-lg px-3 py-2 w-24"
                                  value={variant.stock}
                                  onChange={(e) =>
                                    updateVariant(
                                      index,
                                      "stock",
                                      Number(e.target.value),
                                    )
                                  }
                                />
                              </td>

                              <td className="py-4">
                                <div className="flex items-center gap-3 min-w-[260px]">
                                  {variant.image ? (
                                    <img
                                      src={variant.image}
                                      alt={`${variant.color} ${variant.size}`}
                                      className="w-14 h-14 rounded-lg object-cover border shrink-0"
                                    />
                                  ) : (
                                    <div className="w-14 h-14 rounded-lg border bg-gray-100 shrink-0" />
                                  )}

                                  <input
                                    type="file"
                                    accept="image/*"
                                    className="text-xs max-w-[180px]"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];

                                      if (!file) return;

                                      const toastId =
                                        toast.loading("Uploading...");

                                      try {
                                        const compressedFile =
                                          await imageCompression(file, {
                                            maxSizeMB: 1,
                                            maxWidthOrHeight: 1600,
                                            useWebWorker: true,
                                          });

                                        const formData = new FormData();

                                        formData.append(
                                          "image",
                                          compressedFile,
                                        );

                                        const response = await fetch(
                                          "/api/upload/image-upload",
                                          {
                                            method: "POST",
                                            body: formData,
                                          },
                                        );

                                        const data = await response.json();

                                        if (!response.ok || data.error) {
                                          throw new Error(
                                            data.error || "Upload failed",
                                          );
                                        }

                                        updateVariant(index, "image", data.url);

                                        toast.dismiss(toastId);

                                        appToast.success(
                                          "Success",
                                          "Variant image uploaded",
                                        );
                                      } catch (err) {
                                        console.error(
                                          "Variant image upload failed:",
                                          err,
                                        );

                                        toast.dismiss(toastId);

                                        appToast.error(
                                          "Error",
                                          "Variant image upload failed",
                                        );
                                      }
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* TOTAL INVENTORY */}

                    <div className="mt-6 flex justify-end">
                      <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm">
                        Total Inventory:
                        <span className="font-bold ml-2">{totalStock}</span>
                      </div>
                    </div>
                  </Section>
                )}

                {/* ===================================================== */}
                {/* VARIANT EMPTY STATE */}
                {/* ===================================================== */}

                {hasVariants && variants.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-2xl bg-white p-8 text-center">
                    <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                      +
                    </div>

                    <h3 className="mt-4 font-semibold text-gray-900">
                      Create your product variants
                    </h3>

                    <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                      Select at least one size and one colour above to
                      automatically generate your variants.
                    </p>
                  </div>
                )}

                {/* ===================================================== */}
                {/* PRODUCT IMAGES */}
                {/* ===================================================== */}

                <Section title="Product Images">
                  <ProductImageUploader images={images} setImages={setImages} />
                </Section>

                {/* ===================================================== */}
                {/* PRODUCT VIDEOS */}
                {/* ===================================================== */}

                <section
                  className="bg-white border rounded-2xl p-6 shadow-sm"
                  title="Product Videos"
                >
                  <p className="text-xl font-semibold pb-4">Product Videos</p>

                  <ProductVideoUploader videos={videos} setVideos={setVideos} />
                </section>
              </div>

              {/* ========================================================= */}
              {/* RIGHT */}
              {/* ========================================================= */}

              <div className="space-y-6">
                {/* ===================================================== */}
                {/* STATUS */}
                {/* ===================================================== */}

                <Section title="Status">
                  <div className="space-y-5">
                    <label className="flex items-center justify-between">
                      <span>Featured Product</span>

                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            featured: e.target.checked,
                          })
                        }
                      />
                    </label>

                    <label className="flex items-center justify-between">
                      <span>Flash Deal</span>

                      <input
                        type="checkbox"
                        checked={form.flash}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            flash: e.target.checked,
                          })
                        }
                      />
                    </label>
                  </div>
                </Section>

                {/* ===================================================== */}
                {/* PRODUCT SUMMARY */}
                {/* ===================================================== */}

                <div className="bg-white border rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Product Type</span>

                    <span className="font-semibold">
                      {hasVariants ? "With variants" : "Simple product"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <span className="font-medium">Variants</span>

                    <span className="font-bold">
                      {hasVariants ? variants.length : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total Stock</span>

                    <span className="font-bold">{totalStock}</span>
                  </div>
                </div>

                {/* ===================================================== */}
                {/* SIMPLE PRODUCT SUMMARY */}
                {/* ===================================================== */}

                {!hasVariants && (
                  <div className="rounded-2xl border border-blue-100 bg-blue-50 p-5">
                    <p className="text-sm font-semibold text-blue-900">
                      Simple product
                    </p>

                    <p className="mt-1 text-sm text-blue-700">
                      This product will use its own price and stock without
                      requiring customers to select a variant.
                    </p>
                  </div>
                )}

                {/* ===================================================== */}
                {/* VARIANT SUMMARY */}
                {/* ===================================================== */}

                {hasVariants && (
                  <div className="rounded-2xl border border-gray-200 bg-white p-5">
                    <p className="text-sm font-semibold text-gray-900">
                      Variant product
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      Customers will select a variant before adding this product
                      to their cart.
                    </p>
                  </div>
                )}

                {/* ===================================================== */}
                {/* ACTIONS */}
                {/* ===================================================== */}

                <div className="flex gap-4">
                  <Link href={basePath} className="flex-1">
                    <button
                      type="button"
                      className="w-full border py-3 rounded-xl bg-white hover:bg-gray-50 transition"
                    >
                      Cancel
                    </button>
                  </Link>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-black text-white py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
