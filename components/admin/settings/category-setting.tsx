"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";
import { Trash2 } from "lucide-react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isFeatured: boolean; // ✅ NEW
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isFeatured, setIsFeatured] = useState(true); // ✅ NEW

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  /* ---------------- Load Categories ---------------- */
  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const res = await fetch("/api/admin/category");
      const data = await res.json();

      setCategories(data);
    } catch (err) {
      toast.error("Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---------------- Upload Image ---------------- */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploading(true);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setImageUrl(data.url);

      toast.custom(
        <AdminToast
          type="success"
          title="Upload successful"
          description="Category image uploaded"
        />,
      );
    } catch {
      toast.custom(
        <AdminToast
          type="error"
          title="Upload failed"
          description="Try again"
        />,
      );
    } finally {
      setUploading(false);
    }
  };

  /* ---------------- Create Category ---------------- */
  async function createCategory(e: React.FormEvent) {
    e.preventDefault();

    if (!name) {
      toast.error("Category name required");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/category", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          image: imageUrl,
          isFeatured, // ✅ SEND THIS
        }),
      });

      if (!res.ok) throw new Error();

      toast.custom(
        <AdminToast
          type="success"
          title="Category created"
          description="Successfully added"
        />,
      );

      setName("");
      setImageUrl("");
      setIsFeatured(true); // reset
      loadCategories();
    } catch {
      toast.custom(
        <AdminToast
          type="error"
          title="Error"
          description="Could not create category"
        />,
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Toggle Featured ---------------- */
  async function toggleFeatured(cat: Category) {
    const updated = !cat.isFeatured;

    try {
      const res = await fetch(`/api/admin/category/${cat.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isFeatured: updated }),
      });

      if (!res.ok) throw new Error();

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isFeatured: updated } : c)),
      );

      toast.success("Updated");
    } catch {
      toast.error("Failed to update");
    }
  }

  /* ---------------- Delete ---------------- */
  async function deleteCategory(id: string) {
    const deletingToast = toast.loading("Deleting category...");

    try {
      const res = await fetch(`/api/admin/category/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error();

      setCategories((prev) => prev.filter((c) => c.id !== id));

      toast.success("Category deleted", { id: deletingToast });
    } catch {
      toast.error("Failed to delete category", { id: deletingToast });
    }
  }

  return (
    <div className="p-8 max-w-4xl">
      {/* ---------------- FORM ---------------- */}
      <form
        onSubmit={createCategory}
        className="bg-white border rounded-2xl p-6 shadow-sm space-y-4 mb-8"
      >
        {/* Name */}
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 text-sm"
        />

        {/* Upload */}
        <div className="border-2 border-dashed rounded-xl p-6 text-center">
          {!imageUrl ? (
            <label className="cursor-pointer text-sm text-gray-500">
              {uploading ? "Uploading..." : "Click to upload image"}
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <img src={imageUrl} className="h-20 rounded border" />

              <label className="cursor-pointer text-sm text-[var(--color-primary)] hover:underline">
                Change
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={() => setImageUrl("")}
                className="text-xs text-red-500"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        {/* ✅ Featured toggle */}
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
          />
          Show on homepage
        </label>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-md text-sm"
          >
            {loading ? "Saving..." : "Create Category"}
          </button>
        </div>
      </form>

      {/* ---------------- CATEGORY LIST ---------------- */}
      {loadingCategories ? (
        <p className="text-sm text-gray-500">Loading categories...</p>
      ) : categories.length === 0 ? (
        <p className="text-sm text-gray-400">No categories yet</p>
      ) : (
        <ul className="space-y-3">
          {categories.map((cat) => (
            <li
              key={cat.id}
              className="flex items-center justify-between border rounded-lg p-3"
            >
              <div className="flex items-center gap-4">
                {cat.image && (
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                )}

                <div>
                  <span className="font-medium">{cat.name}</span>

                  {/* ✅ Status */}
                  <p className="text-xs text-gray-500">
                    {cat.isFeatured ? "Visible on homepage" : "Hidden"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Toggle */}
                <button
                  onClick={() => toggleFeatured(cat)}
                  className={`text-xs px-3 py-1 rounded-full ${
                    cat.isFeatured
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {cat.isFeatured ? "Featured" : "Hidden"}
                </button>

                {/* Delete */}
                <button
                  onClick={() => deleteCategory(cat.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
