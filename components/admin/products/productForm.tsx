"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { ProductImageUploader } from "./productImageUploader";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import imageCompression from "browser-image-compression";

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

export function ProductForm({ initialData }: any) {
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

  const [images, setImages] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantType[]>([]);
  const [loading, setLoading] = useState(false);

  const skipGenerateRef = useRef(false);
  /* -------------------------------- FETCH CATEGORIES -------------------------------- */

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/admin/category");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadCategories();
  }, []);

  /* ----------------------------EDIT LOGIC---------------------------- */

  useEffect(() => {
    if (!initialData) return;

    setForm({
      name: initialData.name || "",
      description: initialData.description || "",
      basePrice: initialData.price?.toString() || "",
      category: initialData.categoryId || "",
      subCategory: initialData.subCategory || "",
      featured: initialData.featured || false,
      flash: initialData.isFlashDeal || false,
    });

    setImages(initialData.images || []);

    if (initialData.variants?.length) {
      setVariants(initialData.variants);

      const uniqueSizes = [
        ...new Set<string>(initialData.variants.map((v: any) => v.size)),
      ];

      const uniqueColours = [
        ...new Set<string>(initialData.variants.map((v: any) => v.color)),
      ];

      skipGenerateRef.current = true;
      setSelectedSizes(uniqueSizes);

      setSelectedColours(uniqueColours);
    }
  }, [initialData]);

  /* -------------------------------- GENERATE VARIANTS -------------------------------- */

  useEffect(() => {
    if (skipGenerateRef.current) {
      skipGenerateRef.current = false;
      return;
    }

    setVariants((prev) => {
      const generated = [];

      for (const color of selectedColours) {
        for (const size of selectedSizes) {
          const existing = prev.find(
            (v) => v.color === color && v.size === size,
          );

          if (existing) {
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
  }, [selectedColours, selectedSizes, form.basePrice]);

  /* -------------------------------- TOGGLES -------------------------------- */

  function toggleSize(size: string) {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size],
    );
  }

  function toggleColour(colour: string) {
    setSelectedColours((prev) =>
      prev.includes(colour)
        ? prev.filter((c) => c !== colour)
        : [...prev, colour],
    );
  }

  /* -------------------------------- TOTAL STOCK -------------------------------- */

  const totalStock = useMemo(() => {
    return variants.reduce((acc, item) => acc + item.stock, 0);
  }, [variants]);

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

  /* -------------------------------- SUBMIT -------------------------------- */

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!images.length) {
      toast.error("Please upload product images");
      return;
    }

    if (!variants.length) {
      toast.error("Please create at least one variant");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        ...form,
        price: Number(form.basePrice),
        stock: totalStock,
        images,
        variants,
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
        toast.custom(
          <AdminToast
            type="error"
            title="Failed"
            description={data?.message || "Unable to save"}
          />,
        );

        return;
      }

      toast.custom(
        <AdminToast
          type="success"
          title={isEdit ? "Product Updated" : "Product Created"}
          description="Inventory saved successfully"
        />,
      );

      if (!isEdit) {
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

        setSelectedSizes([]);

        setSelectedColours([]);

        setVariants([]);
      } else {
        router.push("/admin/products");
      }

      router.push("/admin/products");
    } catch (err) {
      toast.custom(
        <AdminToast
          type="error"
          title="Error"
          description="Something went wrong"
        />,
      );
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------------- CUSTOM SIZE -------------------------------- */

  function addCustomSize() {
    const value = customSize.trim();

    if (!value) return;

    if (selectedSizes.includes(value)) {
      toast.error("Size already added");
      return;
    }

    setSelectedSizes((prev) => [...prev, value]);

    setCustomSize("");
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold">
            {isEdit ? "Edit Product" : "Create Product"}
          </h1>

          <p className="text-gray-500 mt-2">
            Manage inventory, variants and pricing
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* LEFT */}
            <div className="lg:col-span-2 space-y-8">
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
                    />
                  </div>
                </div>
              </Section>

              <Section title="Pricing">
                <div>
                  <label className="block mb-2 text-sm font-medium">
                    Base Price
                  </label>

                  <input
                    type="number"
                    min="0"
                    className="input"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        basePrice: e.target.value,
                      })
                    }
                  />
                </div>
              </Section>

              <Section title="Organization">
                <div className="grid md:grid-cols-2 gap-6">
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

                  <input
                    className="input"
                    placeholder="Sub category"
                    value={form.subCategory}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        subCategory: e.target.value,
                      })
                    }
                  />
                </div>
              </Section>

              <Section title="Variant Builder">
                {/* SIZES */}
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
                              : "border-gray-300"
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
                      className="bg-black text-white px-4 rounded-xl"
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
                            className="text-red-500 text-sm"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* COLORS */}
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
                          className={`w-10 h-10 rounded-full border-4 transition ${
                            active
                              ? "border-black scale-110"
                              : "border-gray-200"
                          }`}
                          style={{
                            backgroundColor: colour.hex,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              </Section>

              {/* VARIANT TABLE */}
              {variants.length > 0 && (
                <Section title="Variant Inventory">
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3">Variant</th>

                          <th className="text-left py-3">Price</th>

                          <th className="text-left py-3">Stock</th>
                          <th className="text-left py-3">Image</th>
                        </tr>
                      </thead>

                      <tbody>
                        {variants.map((variant, index) => (
                          <tr
                            key={`${variant.color}-${variant.size}-${index}`}
                            className="border-b"
                          >
                            <td className="py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-5 h-5 rounded-full border"
                                  style={{
                                    backgroundColor: variant.colorHex,
                                  }}
                                />

                                <span>
                                  {variant.color} / {variant.size}
                                </span>
                              </div>
                            </td>

                            <td>
                              <input
                                type="number"
                                min="0"
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

                            <td>
                              <input
                                type="number"
                                min="0"
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
                              <div className="flex items-center gap-3">
                                {variant.image ? (
                                  <img
                                    src={variant.image}
                                    alt=""
                                    className="w-14 h-14 rounded-lg object-cover border"
                                  />
                                ) : (
                                  <div className="w-14 h-14 rounded-lg border bg-gray-100" />
                                )}

                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={async (e) => {
                                    const file = e.target.files?.[0];

                                    if (!file) return;

                                    {
                                      /*Compress file*/
                                    }
                                    const compressedFile =
                                      await imageCompression(file, {
                                        maxSizeMB: 1,
                                        maxWidthOrHeight: 1600,
                                        useWebWorker: true,
                                      });

                                    const formData = new FormData();

                                    formData.append("image", compressedFile);

                                    const toastId =
                                      toast.loading("Uploading...");

                                    try {
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

                                      toast.success("Image uploaded", {
                                        id: toastId,
                                      });
                                    } catch (err) {
                                      toast.error("Upload failed", {
                                        id: toastId,
                                      });
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

                  <div className="mt-6 flex justify-end">
                    <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm">
                      Total Inventory:
                      <span className="font-bold ml-2">{totalStock}</span>
                    </div>
                  </div>
                </Section>
              )}

              <Section title="Product Images">
                <ProductImageUploader images={images} setImages={setImages} />
              </Section>
            </div>

            {/* RIGHT */}
            <div className="space-y-6">
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

              <div className="bg-white border rounded-2xl p-6 shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-medium">Variants</span>

                  <span className="font-bold">{variants.length}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Stock</span>

                  <span className="font-bold">{totalStock}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <Link href="/admin/products" className="flex-1">
                  <button
                    type="button"
                    className="w-full border py-3 rounded-xl"
                  >
                    Cancel
                  </button>
                </Link>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-black text-white py-3 rounded-xl"
                >
                  {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// import { useState, useEffect } from "react";
// import { ProductImageUploader } from "./productImageUploader";
// import toast from "react-hot-toast";
// import { AdminToast } from "@/components/ui/adminToast";
// import Link from "next/link";
// import { useRouter } from "next/navigation";

// const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
// const CATEGORIES = ["MEN", "WOMEN", "ACCESSORIES"];
// const COLOURS = [
//   "Black",
//   "White",
//   "Red",
//   "Blue",
//   "Green",
//   "Yellow",
//   "Brown",
//   "Grey",
//   "Pink",
//   "Purple",
// ];

// type ZodFieldErrors = {
//   fieldErrors?: Record<string, string[]>;
// };

// type ProductFormProps = {
//   initialData?: any;
// };

// type ProductFormState = {
//   name: string;
//   description: string;
//   price: string;
//   stock: string;
//   category: string;
//   subCategory: string;
//   sizes: string[];
//   colours: string[];
//   featured: boolean;
//   flash: boolean;
// };

// type Category = {
//   id: string;
//   name: string;
//   // slug     String   @unique
//   // image    String?
//   // tenantId String
//   // // products  Product[]
//   // tenant   Tenant  @relation(fields: [tenantId], references: [id])
//   // isFeatured Boolean @default(true)
// };

// function Section({ title, children }: any) {
//   return (
//     <div className="border rounded-2xl p-6 bg-white shadow-sm">
//       <h2 className="font-semibold mb-4">{title}</h2>
//       {children}
//     </div>
//   );
// }

// export function ProductForm({ initialData }: ProductFormProps) {
//   const router = useRouter();
//   const isEdit = !!initialData;

//   const [categories, setCategories] = useState<Category[]>([]);

//   // ✅ Initialize form state from initialData
//   const [form, setForm] = useState<ProductFormState>({
//     name: "",
//     description: "",
//     price: "",
//     stock: "",
//     category: "",
//     subCategory: "",
//     sizes: [],
//     colours: [],
//     featured: false,
//     flash: false,
//   });

//   const [images, setImages] = useState<string[]>([]);

//   const [loading, setLoading] = useState(false);

//   console.log("CCCCCCCCCCCCCCCC", form.category);

//   // FETCH CATEGORIES
//   useEffect(() => {
//     async function loadCategories() {
//       try {
//         const res = await fetch("/api/admin/category");
//         const data = await res.json();
//         setCategories(data);
//       } catch (err) {
//         console.error("Failed to load categories");
//       }
//     }

//     loadCategories();
//   }, []);

//   // Fill the form and images from initialData if editing
//   useEffect(() => {
//     if (initialData) {
//       setForm({
//         name: initialData.name || "",
//         description: initialData.description || "",
//         price: initialData.price?.toString() || "",
//         stock: initialData.stock?.toString() || "",
//         category: initialData.categoryId || "",
//         subCategory: initialData.subCategory || "",
//         sizes: initialData.sizes || [],
//         colours: initialData.colours || [],
//         featured: initialData.featured || false,
//         flash: initialData.flash || false,
//       });
//       setImages(initialData.images || []);
//     }
//   }, [initialData]);

//   function toggleSize(size: string) {
//     setForm((prev) => ({
//       ...prev,
//       sizes: prev.sizes.includes(size)
//         ? prev.sizes.filter((s) => s !== size)
//         : [...prev.sizes, size],
//     }));
//   }

//   function toggleColour(colour: string) {
//     setForm((prev) => ({
//       ...prev,
//       colours: prev.colours.includes(colour)
//         ? prev.colours.filter((c) => c !== colour)
//         : [...prev.colours, colour],
//     }));
//   }

//   async function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     if (!images.length) {
//       toast.error("Please upload at least one image");
//       return;
//     }

//     try {
//       setLoading(true);

//       const payload = {
//         ...form,
//         price: Number(form.price),
//         stock: Number(form.stock),
//         images,
//       };
//       // if (isEdit) {
//       //   console.log("EDIT ID", initialData.id);
//       // }
//       console.log("PAYLOAD", payload);

//       const response = await fetch(
//         isEdit ? `/api/admin/products/${initialData.id}` : "/api/products",
//         {
//           method: isEdit ? "PATCH" : "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           credentials: "include",
//           body: JSON.stringify(payload),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) {
//         if (data?.errors?.fieldErrors) {
//           const fieldErrors = (data.errors as ZodFieldErrors)?.fieldErrors;
//           const firstError = fieldErrors
//             ? Object.values(fieldErrors)[0]?.[0]
//             : undefined;
//           toast.custom(
//             <AdminToast
//               type="error"
//               title="Upload failed!"
//               description={firstError || "Invalid product data"}
//             />,
//             { duration: 6000 },
//           );
//         } else {
//           toast.custom(
//             <AdminToast
//               type="error"
//               title="Upload failed!"
//               description={data?.message || "Failed to save product"}
//             />,
//             { duration: 6000 },
//           );
//         }
//         return;
//       }

//       toast.custom(
//         <AdminToast
//           type="success"
//           title={isEdit ? "Product updated" : "Product created"}
//           description="Your product is now live in the store"
//         />,
//         { duration: 6000 },
//       );

//       // reset form if creating
//       if (!isEdit) {
//         setForm({
//           name: "",
//           description: "",
//           price: "",
//           stock: "",
//           category: "",
//           subCategory: "",
//           sizes: [],
//           colours: [],
//           featured: false,
//           flash: false,
//         });
//         setImages([]);
//       } else {
//         router.push("/admin/products");
//       }
//     } catch (err) {
//       toast.custom(
//         <AdminToast
//           type="error"
//           title="Upload failed!"
//           description="Something went wrong. Please try again."
//         />,
//         { duration: 6000 },
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 py-10">
//       <div className="max-w-7xl mx-auto px-6">
//         <div className="mb-8">
//           <h1 className="text-2xl font-semibold">
//             {isEdit ? "Edit Product" : "Create Product"}
//           </h1>
//           <p className="text-sm text-gray-500">
//             {isEdit
//               ? "Update your product details"
//               : "Add a new product to your store"}
//           </p>
//         </div>

//         <form onSubmit={handleSubmit}>
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//             {/* LEFT SIDE */}
//             <div className="lg:col-span-2 space-y-8">
//               <Section title="Basic Information">
//                 <div className="space-y-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Product Name
//                     </label>
//                     <input
//                       required
//                       placeholder="Enter product name"
//                       className="input focus:ring-[var(--color-primary-ring)]"
//                       value={form.name}
//                       onChange={(e) =>
//                         setForm({ ...form, name: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Description
//                     </label>
//                     <textarea
//                       rows={4}
//                       className="input focus:ring-[var(--color-primary-ring)]"
//                       value={form.description}
//                       onChange={(e) =>
//                         setForm({ ...form, description: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </Section>

//               <Section title="Pricing & Inventory">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Price
//                     </label>
//                     <input
//                       type="number"
//                       min="0"
//                       inputMode="numeric"
//                       required
//                       className="input focus:ring-[var(--color-primary-ring)]"
//                       value={form.price}
//                       onChange={(e) =>
//                         setForm({ ...form, price: e.target.value })
//                       }
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-1">
//                       Stock Quantity
//                     </label>
//                     <input
//                       type="number"
//                       min={0}
//                       inputMode="numeric"
//                       required
//                       className="input focus:ring-[var(--color-primary-ring)]"
//                       value={form.stock}
//                       onChange={(e) =>
//                         setForm({ ...form, stock: e.target.value })
//                       }
//                     />
//                   </div>
//                 </div>
//               </Section>

//               <Section title="Organization">
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <select
//                     value={form.category}
//                     onChange={(e) =>
//                       setForm({ ...form, category: e.target.value })
//                     }
//                     className="w-full border rounded-lg px-3 py-2 text-sm"
//                   >
//                     <option value="">Select Category</option>

//                     {categories.map((cat) => (
//                       <option key={cat.id} value={cat.id}>
//                         {cat.name}
//                       </option>
//                     ))}
//                   </select>
//                   <input
//                     className="input focus:ring-[var(--color-primary-ring)]"
//                     placeholder="Sub category (e.g. T-Shirt)"
//                     value={form.subCategory}
//                     onChange={(e) =>
//                       setForm({ ...form, subCategory: e.target.value })
//                     }
//                   />
//                 </div>
//               </Section>

//               <Section title="Variants">
//                 <div className="mb-6">
//                   <p className="text-sm font-medium mb-2">Sizes</p>
//                   <div className="flex flex-wrap gap-2">
//                     {SIZES.map((size) => {
//                       const active = form.sizes.includes(size);
//                       return (
//                         <button
//                           type="button"
//                           key={size}
//                           onClick={() => toggleSize(size)}
//                           className={`px-3 py-1 rounded-md border text-sm ${
//                             active
//                               ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
//                               : "border-gray-300"
//                           }`}
//                         >
//                           {size}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>

//                 <div>
//                   <p className="text-sm font-medium mb-2">Colours</p>
//                   <div className="flex flex-wrap gap-2">
//                     {COLOURS.map((colour) => {
//                       const active = form.colours.includes(colour);
//                       return (
//                         <button
//                           type="button"
//                           key={colour}
//                           onClick={() => toggleColour(colour)}
//                           className={`px-3 py-1 rounded-md border text-sm ${
//                             active
//                               ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
//                               : "border-gray-300"
//                           }`}
//                         >
//                           {colour}
//                         </button>
//                       );
//                     })}
//                   </div>
//                 </div>
//               </Section>

//               <Section title="Product Images">
//                 <ProductImageUploader
//                   onUploadComplete={(imgs) => setImages(imgs)}
//                   initialImages={images}
//                 />
//               </Section>

//               <div className="flex justify-between items-center pt-6 border-t">
//                 <Link href={"/admin/products"}>
//                   <button
//                     type="button"
//                     className="text-gray-700 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 transition"
//                   >
//                     Cancel
//                   </button>
//                 </Link>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="bg-[var(--color-primary)] text-white px-6 py-3 rounded-md hover:bg-[var(--color-primary-dark)]"
//                 >
//                   {loading
//                     ? isEdit
//                       ? "Updating..."
//                       : "Saving..."
//                     : isEdit
//                       ? "Update Product"
//                       : "Save Product"}
//                 </button>
//               </div>
//             </div>

//             {/* RIGHT SIDEBAR */}
//             <div className="space-y-6">
//               <div className="border rounded-2xl p-6 bg-white shadow-sm ">
//                 <h3 className="font-semibold mb-4">Status</h3>
//                 <div className="flex flex-col gap-4">
//                   <label className="flex items-center justify-between">
//                     <span>Featured Product</span>
//                     <input
//                       type="checkbox"
//                       checked={form.featured}
//                       onChange={(e) =>
//                         setForm({ ...form, featured: e.target.checked })
//                       }
//                     />
//                   </label>
//                   <label className="flex items-center justify-between">
//                     <span>Flash Product</span>
//                     <input
//                       type="checkbox"
//                       checked={form.flash}
//                       onChange={(e) =>
//                         setForm({ ...form, flash: e.target.checked })
//                       }
//                     />
//                   </label>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
