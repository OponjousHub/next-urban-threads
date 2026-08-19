"use client";

import { useState, useEffect, useMemo, useRef } from "react";
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
  id?: string;
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
  category: string;
  subCategory: string;
  featured: boolean;
  flash: boolean;
};

type Category = {
  id: string;
  name: string;
};

type ProductSearchProps = {
  basePath: string;
  initialData?: any;
  admin?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
  };
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export function ProductForm({
  initialData,
  basePath,
  admin,
}: ProductSearchProps) {
  const router = useRouter();

  const isEdit = !!initialData;

  const [categories, setCategories] = useState<Category[]>([]);

  const [customSize, setCustomSize] = useState("");

  const [form, setForm] = useState<ProductFormState>({
    name: "",
    description: "",
    basePrice: "",
    category: "",
    subCategory: "",
    featured: false,
    flash: false,
  });

  /*
   * Whether this product uses variants.
   *
   * New products default to false.
   * Existing products automatically detect this from their variants.
   */
  const [hasVariants, setHasVariants] = useState(false);

  /*
   * Stock for products WITHOUT variants.
   */
  const [productStock, setProductStock] = useState(0);

  const [videos, setVideos] = useState<{ url: string; public_id: string }[]>(
    [],
  );

  const [images, setImages] = useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  const [variants, setVariants] = useState<VariantType[]>([]);

  const [loading, setLoading] = useState(false);

  /*
   * Tracks whether we're hydrating an existing product.
   *
   * This prevents the variant generator from immediately
   * replacing variants that were loaded from the database.
   */
  const skipGenerateRef = useRef(false);

  /*
   * Keeps track of variant image uploads.
   *
   * The key is the variant index.
   */
  const [uploadingVariantImages, setUploadingVariantImages] = useState<
    Record<number, boolean>
  >({});

  /* ---------------------------------------------------------
     FETCH CATEGORIES
  --------------------------------------------------------- */

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");

        if (!res.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await res.json();

        setCategories(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }

    loadCategories();
  }, []);

  /* ---------------------------------------------------------
     EDIT / INITIAL DATA HYDRATION
  --------------------------------------------------------- */

  useEffect(() => {
    if (!initialData) return;

    /*
     * Normalize variants coming from Prisma/API.
     *
     * This is important because edit mode must preserve:
     * - id
     * - color
     * - colorHex
     * - size
     * - stock
     * - price
     * - image
     */
    const existingVariants: VariantType[] = Array.isArray(initialData.variants)
      ? initialData.variants.map((variant: any) => ({
          id: variant.id,
          color: variant.color || "",
          colorHex:
            variant.colorHex ||
            COLOR_MAP[variant.color as keyof typeof COLOR_MAP] ||
            "#000000",
          size: variant.size || "",
          stock: Number(variant.stock ?? 0),
          price: Number(variant.price ?? initialData.price ?? 0),
          image: variant.image || "",
        }))
      : [];

    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      basePrice:
        initialData.price !== undefined && initialData.price !== null
          ? String(initialData.price)
          : "",
      category: initialData.categoryId || "",
      subCategory: initialData.subCategory || "",
      featured: Boolean(initialData.featured),
      flash: Boolean(initialData.isFlashDeal),
    });

    setImages(Array.isArray(initialData.images) ? initialData.images : []);

    setVideos(Array.isArray(initialData.videos) ? initialData.videos : []);

    /*
     * If variants exist, this product is a variant product.
     *
     * Otherwise use the stored hasVariants value if available.
     */
    const productHasVariants =
      existingVariants.length > 0 || Boolean(initialData.hasVariants);

    setHasVariants(productHasVariants);

    /*
     * For products without variants, use the product's own stock.
     */
    setProductStock(Number(initialData.stock ?? 0));

    /*
     * Hydrate variants exactly as they exist in the database.
     */
    setVariants(existingVariants);

    /*
     * Reconstruct selected sizes and colours.
     */
    if (existingVariants.length > 0) {
      const uniqueSizes = [
        ...new Set(existingVariants.map((variant) => variant.size)),
      ].filter(Boolean);

      const uniqueColours = [
        ...new Set(existingVariants.map((variant) => variant.color)),
      ].filter(Boolean);

      /*
       * Tell the generator to stay away from the hydrated variants.
       */
      skipGenerateRef.current = true;

      setSelectedSizes(uniqueSizes);

      setSelectedColours(uniqueColours);
    } else {
      setSelectedSizes([]);
      setSelectedColours([]);
    }
  }, [initialData]);

  /* ---------------------------------------------------------
     GENERATE VARIANTS
  --------------------------------------------------------- */

  useEffect(() => {
    /*
     * If variants are disabled, there is nothing to generate.
     */
    if (!hasVariants) {
      return;
    }

    /*
     * When loading an existing product, don't regenerate
     * variants from selected colours/sizes.
     */
    if (skipGenerateRef.current) {
      skipGenerateRef.current = false;
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
            /*
             * Preserve the complete existing variant.
             *
             * This prevents image/stock/price from disappearing.
             */
            generated.push(existing);
          } else {
            generated.push({
              color,
              size,
              colorHex: COLOR_MAP[color as keyof typeof COLOR_MAP] || "#000000",
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

  /* ---------------------------------------------------------
     TOGGLE VARIANT MODE
  --------------------------------------------------------- */

  function handleVariantModeChange(enabled: boolean) {
    setHasVariants(enabled);

    if (!enabled) {
      /*
       * Keep the variant data in memory temporarily so that
       * accidentally switching the toggle doesn't destroy it.
       *
       * The payload will explicitly send [] when variants are
       * disabled, causing the API to remove them.
       */
      setSelectedSizes([]);
      setSelectedColours([]);
    }
  }

  /* ---------------------------------------------------------
     SIZE TOGGLE
  --------------------------------------------------------- */

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  /* ---------------------------------------------------------
     COLOUR TOGGLE
  --------------------------------------------------------- */

  function toggleColour(colour: string) {
    setSelectedColours((prev) =>
      prev.includes(colour)
        ? prev.filter((c) => c !== colour)
        : [...prev, colour],
    );
  }

  /* ---------------------------------------------------------
     TOTAL STOCK
  --------------------------------------------------------- */

  const totalVariantStock = useMemo(() => {
    return variants.reduce((acc, item) => acc + Number(item.stock || 0), 0);
  }, [variants]);

  const totalStock = hasVariants ? totalVariantStock : productStock;

  /* ---------------------------------------------------------
     UPDATE VARIANT
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     VARIANT IMAGE UPLOAD
  --------------------------------------------------------- */

  async function uploadVariantImage(index: number, file: File) {
    if (!file) return;

    setUploadingVariantImages((prev) => ({
      ...prev,
      [index]: true,
    }));

    const toastId = toast.loading("Uploading variant image...");

    try {
      const compressedFile = await imageCompression(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });

      const formData = new FormData();

      formData.append("image", compressedFile);

      const response = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Upload failed");
      }

      updateVariant(index, "image", data.url);

      toast.dismiss(toastId);

      appToast.success("Success", "Variant image uploaded");
    } catch (error) {
      console.error("Variant image upload failed:", error);

      toast.dismiss(toastId);

      appToast.error("Error", "Variant image upload failed");
    } finally {
      setUploadingVariantImages((prev) => ({
        ...prev,
        [index]: false,
      }));
    }
  }

  /* ---------------------------------------------------------
     CUSTOM SIZE
  --------------------------------------------------------- */

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

  /* ---------------------------------------------------------
     SUBMIT
  --------------------------------------------------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      appToast.warning("Required", "Please enter a product name");
      return;
    }

    if (!form.basePrice || Number(form.basePrice) <= 0) {
      appToast.warning("Required", "Please enter a valid product price");
      return;
    }

    if (!form.category) {
      appToast.warning("Required", "Please select a category");
      return;
    }

    if (!images.length) {
      appToast.warning("Warning", "Please upload product images");
      return;
    }

    /*
     * Only validate variants when variants are enabled.
     */
    if (hasVariants) {
      if (!selectedSizes.length) {
        appToast.warning("Required", "Please select at least one size");
        return;
      }

      if (!selectedColours.length) {
        appToast.warning("Required", "Please select at least one colour");
        return;
      }

      if (!variants.length) {
        appToast.warning("Warning", "Please create at least one variant");
        return;
      }
    }

    try {
      setLoading(true);

      /*
       * IMPORTANT:
       *
       * If hasVariants === true:
       *   send the complete variant array.
       *
       * If hasVariants === false:
       *   send [].
       *
       * The API will understand [] as "remove all variants".
       */
      const payload = {
        ...form,

        price: Number(form.basePrice),

        stock: totalStock,

        hasVariants,

        images,

        videos,

        variants: hasVariants
          ? variants.map((variant) => ({
              id: variant.id,
              color: variant.color,
              colorHex: variant.colorHex,
              size: variant.size,
              stock: Number(variant.stock || 0),
              price: Number(variant.price || form.basePrice || 0),
              image: variant.image || "",
            }))
          : [],
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
        appToast.error("Failed", data?.message || "Unable to save product");
        return;
      }

      appToast.success(
        isEdit ? "Success" : "Success",
        isEdit
          ? "Product updated successfully"
          : "Product created successfully",
      );

      if (!isEdit) {
        /*
         * Reset the form after creating a new product.
         */
        setForm({
          name: "",
          description: "",
          basePrice: "",
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
        setProductStock(0);

        return;
      }

      /*
       * Edit mode.
       */
      router.push(basePath);
      router.refresh();
    } catch (error) {
      console.error("PRODUCT_SAVE_ERROR:", error);

      appToast.error("Error", "Something went wrong while saving the product");
    } finally {
      setLoading(false);
    }
  }

  /* ---------------------------------------------------------
     RENDER
  --------------------------------------------------------- */

  return (
    <>
      <AdminHeaderUI
        title={`${isEdit ? "Edit" : "Create"} product`}
        subtitle={`${
          isEdit ? "Edit" : "Create"
        } inventory, variants and pricing`}
        admin={admin}
      />

      <div className="min-h-screen bg-gray-50 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* =====================================================
                  LEFT
              ===================================================== */}

              <div className="space-y-8 lg:col-span-2">
                {/* BASIC INFORMATION */}

                <Section title="Basic Information">
                  <div className="space-y-6">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
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
                        placeholder="e.g. Premium Cotton Hoodie"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium">
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

                {/* PRICING */}

                <Section title="Pricing">
                  <div>
                    <label className="mb-2 block text-sm font-medium">
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
                      This is the default product price. Individual variant
                      prices can be adjusted below.
                    </p>
                  </div>
                </Section>

                {/* ORGANIZATION */}

                <Section title="Organization">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Category
                      </label>

                      <select
                        required
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
                      <label className="mb-2 block text-sm font-medium">
                        Sub category
                      </label>

                      <input
                        className="input"
                        placeholder="e.g. Hoodies"
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

                {/* VARIANT MODE */}

                <Section title="Product Options">
                  <div className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
                    <div className="flex items-start justify-between gap-6">
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          This product has variants
                        </h3>

                        <p className="mt-1 max-w-xl text-sm text-gray-500">
                          Enable this when customers need to choose options such
                          as size, colour, or another combination.
                        </p>
                      </div>

                      <button
                        type="button"
                        role="switch"
                        aria-checked={hasVariants}
                        onClick={() => handleVariantModeChange(!hasVariants)}
                        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                          hasVariants ? "bg-black" : "bg-gray-300"
                        }`}
                      >
                        <span
                          className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                            hasVariants ? "left-6" : "left-1"
                          }`}
                        />
                      </button>
                    </div>

                    {!hasVariants && (
                      <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
                        <p className="text-sm font-medium text-blue-900">
                          Simple product
                        </p>

                        <p className="mt-1 text-sm text-blue-700">
                          This product will be sold without size, colour, or
                          other variants.
                        </p>
                      </div>
                    )}
                  </div>
                </Section>

                {/* NON-VARIANT STOCK */}

                {!hasVariants && (
                  <Section title="Inventory">
                    <div>
                      <label className="mb-2 block text-sm font-medium">
                        Product Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        step="1"
                        className="input"
                        value={productStock}
                        onChange={(e) =>
                          setProductStock(
                            Math.max(0, Number(e.target.value) || 0),
                          )
                        }
                      />

                      <p className="mt-2 text-xs text-gray-500">
                        Enter the total quantity available for this product.
                      </p>
                    </div>
                  </Section>
                )}

                {/* VARIANT BUILDER */}

                {hasVariants && (
                  <Section title="Variant Builder">
                    {/* SIZES */}

                    <div className="mb-8">
                      <p className="mb-3 font-medium">Sizes</p>

                      <div className="mb-4 flex flex-wrap gap-2">
                        {SIZES.map((size) => {
                          const active = selectedSizes.includes(size);

                          return (
                            <button
                              key={size}
                              type="button"
                              onClick={() => toggleSize(size)}
                              className={`rounded-xl border px-4 py-2 transition ${
                                active
                                  ? "border-black bg-black text-white"
                                  : "border-gray-300 bg-white"
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
                        />

                        <button
                          type="button"
                          onClick={addCustomSize}
                          className="rounded-xl bg-black px-4 text-white"
                        >
                          Add
                        </button>
                      </div>

                      {/* SELECTED SIZES */}

                      {selectedSizes.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedSizes.map((size) => (
                            <div
                              key={size}
                              className="flex items-center gap-2 rounded-xl bg-gray-100 px-3 py-2"
                            >
                              <span>{size}</span>

                              <button
                                type="button"
                                onClick={() =>
                                  setSelectedSizes((prev) =>
                                    prev.filter((s) => s !== size),
                                  )
                                }
                                className="text-sm text-red-500"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* COLOURS */}

                    <div>
                      <p className="mb-3 font-medium">Colours</p>

                      <div className="flex flex-wrap gap-3">
                        {COLOURS.map((colour) => {
                          const active = selectedColours.includes(colour.name);

                          return (
                            <button
                              key={colour.name}
                              type="button"
                              title={colour.name}
                              onClick={() => toggleColour(colour.name)}
                              className={`h-10 w-10 rounded-full border-4 transition ${
                                active
                                  ? "scale-110 border-black"
                                  : "border-gray-200"
                              }`}
                              style={{
                                backgroundColor: colour.hex,
                              }}
                            />
                          );
                        })}
                      </div>

                      {selectedColours.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {selectedColours.map((colour) => (
                            <span
                              key={colour}
                              className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                            >
                              {colour}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Section>
                )}

                {/* VARIANT TABLE */}

                {hasVariants && variants.length > 0 && (
                  <Section title="Variant Inventory">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 text-left">Variant</th>

                            <th className="py-3 text-left">Price</th>

                            <th className="py-3 text-left">Stock</th>

                            <th className="py-3 text-left">Image</th>
                          </tr>
                        </thead>

                        <tbody>
                          {variants.map((variant, index) => {
                            const isUploading = Boolean(
                              uploadingVariantImages[index],
                            );

                            return (
                              <tr
                                key={
                                  variant.id ||
                                  `${variant.color}-${variant.size}-${index}`
                                }
                                className="border-b last:border-0"
                              >
                                {/* VARIANT */}

                                <td className="py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="h-5 w-5 shrink-0 rounded-full border"
                                      style={{
                                        backgroundColor: variant.colorHex,
                                      }}
                                    />

                                    <span>
                                      {variant.color} / {variant.size}
                                    </span>
                                  </div>
                                </td>

                                {/* PRICE */}

                                <td className="py-4">
                                  <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    className="w-28 rounded-lg border px-3 py-2"
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

                                {/* STOCK */}

                                <td className="py-4">
                                  <input
                                    type="number"
                                    min="0"
                                    step="1"
                                    className="w-24 rounded-lg border px-3 py-2"
                                    value={variant.stock}
                                    onChange={(e) =>
                                      updateVariant(
                                        index,
                                        "stock",
                                        Math.max(
                                          0,
                                          Number(e.target.value) || 0,
                                        ),
                                      )
                                    }
                                  />
                                </td>

                                {/* IMAGE */}

                                <td className="py-4">
                                  <div className="flex min-w-[300px] items-center gap-3">
                                    {/* Preview */}

                                    {variant.image ? (
                                      <img
                                        src={variant.image}
                                        alt={`${variant.color} ${variant.size}`}
                                        className="h-14 w-14 shrink-0 rounded-lg border object-cover"
                                      />
                                    ) : (
                                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border bg-gray-100">
                                        <span className="text-xs text-gray-400">
                                          No image
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex flex-col gap-2">
                                      <label
                                        className={`inline-flex cursor-pointer items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition ${
                                          isUploading
                                            ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                                            : "border-gray-300 bg-white text-gray-700 hover:border-black hover:text-black"
                                        }`}
                                      >
                                        {isUploading ? (
                                          <span className="flex items-center gap-2">
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-black" />
                                            Uploading...
                                          </span>
                                        ) : (
                                          <>
                                            {variant.image
                                              ? "Change image"
                                              : "Upload image"}
                                          </>
                                        )}

                                        <input
                                          type="file"
                                          accept="image/*"
                                          disabled={isUploading}
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];

                                            if (!file) return;

                                            uploadVariantImage(index, file);

                                            /*
                                             * Allow the same file to
                                             * be selected again later.
                                             */
                                            e.target.value = "";
                                          }}
                                        />
                                      </label>

                                      {variant.image && (
                                        <span className="text-xs text-gray-400">
                                          Variant-specific image
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-6 flex justify-end">
                      <div className="rounded-xl bg-gray-100 px-4 py-3 text-sm">
                        Total Inventory:
                        <span className="ml-2 font-bold">
                          {totalVariantStock}
                        </span>
                      </div>
                    </div>
                  </Section>
                )}

                {/* PRODUCT IMAGES */}

                <Section title="Product Images">
                  <ProductImageUploader images={images} setImages={setImages} />
                </Section>

                {/* PRODUCT VIDEOS */}

                <section className="rounded-xl bg-white p-6">
                  <p className="pb-4 text-xl font-semibold">Product Videos</p>

                  <ProductVideoUploader videos={videos} setVideos={setVideos} />
                </section>
              </div>

              {/* =====================================================
                  RIGHT
              ===================================================== */}

              <div className="space-y-6">
                {/* STATUS */}

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

                {/* SUMMARY */}

                <div className="rounded-2xl border bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="font-medium">Product type</span>

                    <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold">
                      {hasVariants ? "Variants" : "Simple"}
                    </span>
                  </div>

                  {hasVariants && (
                    <div className="mb-4 flex items-center justify-between">
                      <span className="font-medium">Variants</span>

                      <span className="font-bold">{variants.length}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Stock</span>

                    <span className="font-bold">{totalStock}</span>
                  </div>
                </div>

                {/* ACTIONS */}

                <div className="flex gap-4">
                  <Link href={basePath} className="flex-1">
                    <button
                      type="button"
                      className="w-full rounded-xl border py-3 transition hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </Link>

                  <button
                    type="submit"
                    disabled={
                      loading ||
                      Object.values(uploadingVariantImages).some(Boolean)
                    }
                    className="flex-1 rounded-xl bg-black py-3 text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Saving...
                      </span>
                    ) : isEdit ? (
                      "Update Product"
                    ) : (
                      "Create Product"
                    )}
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
