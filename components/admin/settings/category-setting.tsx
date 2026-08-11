"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Trash2, Pencil, FolderInput, X, Upload, Loader2 } from "lucide-react";
import { appToast } from "@/utils/appToast";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
  isFeatured: boolean;
};

type CategoryProduct = {
  id: string;
  name: string;
  image?: string | null;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);

  // Create form
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isFeatured, setIsFeatured] = useState(true);

  // Loading states
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  // Edit modal
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editIsFeatured, setEditIsFeatured] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);

  // Move products modal
  const [movingCategory, setMovingCategory] = useState<Category | null>(null);
  const [moveTargetId, setMoveTargetId] = useState("");
  const [categoryProducts, setCategoryProducts] = useState<CategoryProduct[]>(
    [],
  );
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [movingProducts, setMovingProducts] = useState(false);

  // Delete state
  const [deletingCategoryId, setDeletingCategoryId] = useState<string | null>(
    null,
  );

  /* ---------------- Load Categories ---------------- */

  async function loadCategories() {
    try {
      setLoadingCategories(true);

      const res = await fetch("/api/admin/category", {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("Failed to load categories");
      }

      const data = await res.json();

      setCategories(data);
    } catch {
      appToast.error("Error", "Failed to load categories");
    } finally {
      setLoadingCategories(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  /* ---------------- Upload Image ---------------- */

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mode: "create" | "edit",
  ) => {
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

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      if (mode === "create") {
        setImageUrl(data.url);
      } else {
        setEditImageUrl(data.url);
      }

      appToast.success("Success", "Category image uploaded");
    } catch {
      appToast.error("Error", "Failed to upload category image");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  /* ---------------- Create Category ---------------- */

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();

    if (!name.trim()) {
      appToast.warning("Warning", "Category name required");
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
          name: name.trim(),
          image: imageUrl || null,
          isFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Could not create category",
        );
      }

      appToast.success("Category created", "Successfully added");

      setName("");
      setImageUrl("");
      setIsFeatured(true);

      await loadCategories();
    } catch (error) {
      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Could not create category",
      );
    } finally {
      setLoading(false);
    }
  }

  /* ---------------- Open Edit ---------------- */

  function openEditCategory(category: Category) {
    setEditingCategory(category);
    setEditName(category.name);
    setEditImageUrl(category.image || "");
    setEditIsFeatured(category.isFeatured);
  }

  /* ---------------- Save Edit ---------------- */

  async function saveEditCategory() {
    if (!editingCategory) return;

    if (!editName.trim()) {
      appToast.warning("Warning", "Category name required");
      return;
    }

    try {
      setSavingEdit(true);

      const res = await fetch(`/api/admin/category/${editingCategory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          name: editName.trim(),
          image: editImageUrl || null,
          isFeatured: editIsFeatured,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to update category",
        );
      }

      setCategories((prev) =>
        prev.map((category) =>
          category.id === editingCategory.id ? data.category : category,
        ),
      );

      setEditingCategory(null);

      appToast.success("Category updated", "Category details saved");
    } catch (error) {
      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to update category",
      );
    } finally {
      setSavingEdit(false);
    }
  }

  /* ---------------- Toggle Featured ---------------- */

  async function toggleFeatured(category: Category) {
    const updated = !category.isFeatured;

    try {
      const res = await fetch(`/api/admin/category/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "update",
          isFeatured: updated,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to update category",
        );
      }

      setCategories((prev) =>
        prev.map((item) => (item.id === category.id ? data.category : item)),
      );

      appToast.success(
        "Category updated",
        updated
          ? "Category is now visible on the homepage"
          : "Category hidden from homepage",
      );
    } catch (error) {
      appToast.error(
        "Error",
        error instanceof Error ? error.message : "Failed to update category",
      );
    }
  }

  /* ---------------- Load Products For Move ---------------- */

  async function openMoveProducts(category: Category) {
    setMovingCategory(category);
    setMoveTargetId("");
    setCategoryProducts([]);
    setLoadingProducts(true);

    try {
      const res = await fetch(`/api/admin/category/${category.id}`, {
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to load products",
        );
      }

      setCategoryProducts(data.products || []);
    } catch (error) {
      appToast.error(
        "Error",
        error instanceof Error
          ? error.message
          : "Failed to load category products",
      );

      setMovingCategory(null);
    } finally {
      setLoadingProducts(false);
    }
  }

  /* ---------------- Move Products ---------------- */

  async function moveProducts() {
    if (!movingCategory) return;

    if (!moveTargetId) {
      appToast.warning(
        "Choose a category",
        "Select the category where the products should be moved.",
      );
      return;
    }

    if (moveTargetId === movingCategory.id) {
      appToast.warning(
        "Invalid category",
        "Products are already in this category.",
      );
      return;
    }

    try {
      setMovingProducts(true);

      const res = await fetch(`/api/admin/category/${movingCategory.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "moveProducts",
          targetCategoryId: moveTargetId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to move products",
        );
      }

      appToast.success(
        "Products moved",
        `${data.movedCount} ${
          data.movedCount === 1 ? "product has" : "products have"
        } been moved successfully.`,
      );

      setMovingCategory(null);
      setCategoryProducts([]);
      setMoveTargetId("");
    } catch (error) {
      appToast.error(
        "Unable to move products",
        error instanceof Error ? error.message : "Failed to move products",
      );
    } finally {
      setMovingProducts(false);
    }
  }

  /* ---------------- Delete ---------------- */

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Delete "${category.name}"?\n\nThis category can only be deleted when it has no products assigned to it.`,
    );

    if (!confirmed) return;

    setDeletingCategoryId(category.id);

    const deletingToast = toast.loading("Deleting category...");

    try {
      const res = await fetch(`/api/admin/category/${category.id}`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete category",
        );
      }

      setCategories((prev) => prev.filter((item) => item.id !== category.id));

      toast.success("Category deleted successfully", {
        id: deletingToast,
      });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete category",
        {
          id: deletingToast,
        },
      );
    } finally {
      setDeletingCategoryId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* ========================================================= */}
      {/* CREATE CATEGORY */}
      {/* ========================================================= */}

      <form
        onSubmit={createCategory}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900">
            Create Category
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Add a product category and choose whether it should appear on the
            homepage.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category name
            </label>

            <input
              type="text"
              placeholder="e.g. Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
            />
          </div>

          {/* Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Category image
            </label>

            <div className="rounded-xl border-2 border-dashed border-gray-200 p-4">
              {!imageUrl ? (
                <label className="flex cursor-pointer flex-col items-center justify-center py-6 text-sm text-gray-500 hover:text-gray-700">
                  <Upload size={20} className="mb-2" />

                  {uploading ? "Uploading..." : "Click to upload image"}

                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, "create")}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-4">
                  <img
                    src={imageUrl}
                    alt="Category"
                    className="h-16 w-16 rounded-lg border object-cover"
                  />

                  <div className="flex flex-col gap-2">
                    <label className="cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">
                      Change image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "create")}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setImageUrl("")}
                      className="text-left text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Featured */}
        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="h-4 w-4 rounded"
          />

          <span>
            <span className="font-medium">Show on homepage</span>
            <span className="ml-2 text-gray-400">Featured category</span>
          </span>
        </label>

        {/* Submit */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={loading || uploading}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}

            {loading ? "Creating..." : "Create Category"}
          </button>
        </div>
      </form>

      {/* ========================================================= */}
      {/* CATEGORY LIST */}
      {/* ========================================================= */}

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-100 px-6 py-5">
          <h2 className="text-lg font-semibold text-gray-900">Categories</h2>

          <p className="mt-1 text-sm text-gray-500">
            Manage your store categories, images and products.
          </p>
        </div>

        <div className="p-6">
          {loadingCategories ? (
            <div className="flex items-center justify-center py-12 text-sm text-gray-500">
              <Loader2 size={18} className="mr-2 animate-spin" />
              Loading categories...
            </div>
          ) : categories.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">No categories yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 p-4 transition hover:border-gray-200 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  {/* Category information */}
                  <div className="flex min-w-0 items-center gap-4">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="h-14 w-14 shrink-0 rounded-xl border border-gray-100 object-cover"
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs text-gray-400">
                        No image
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">
                        {category.name}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {category.isFeatured
                          ? "Visible on homepage"
                          : "Hidden from homepage"}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Featured */}
                    <button
                      type="button"
                      onClick={() => toggleFeatured(category)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                        category.isFeatured
                          ? "bg-green-100 text-green-700 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {category.isFeatured ? "Featured" : "Hidden"}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => openEditCategory(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <Pencil size={14} />
                      Edit
                    </button>

                    {/* Move products */}
                    <button
                      type="button"
                      onClick={() => openMoveProducts(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      <FolderInput size={14} />
                      Move products
                    </button>

                    {/* Delete */}
                    <button
                      type="button"
                      disabled={deletingCategoryId === category.id}
                      onClick={() => deleteCategory(category)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {deletingCategoryId === category.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <Trash2 size={14} />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* EDIT MODAL */}
      {/* ========================================================= */}

      {editingCategory && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h3 className="font-semibold text-gray-900">Edit category</h3>

                <p className="mt-1 text-xs text-gray-500">
                  Update the category details.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !savingEdit && setEditingCategory(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category name
                </label>

                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                />
              </div>

              {/* Image */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category image
                </label>

                <div className="rounded-xl border-2 border-dashed border-gray-200 p-4">
                  {editImageUrl ? (
                    <div className="flex items-center gap-4">
                      <img
                        src={editImageUrl}
                        alt={editName}
                        className="h-20 w-20 rounded-xl border object-cover"
                      />

                      <div className="space-y-2">
                        <label className="block cursor-pointer text-sm font-medium text-[var(--color-primary)] hover:underline">
                          Change image
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileUpload(e, "edit")}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setEditImageUrl("")}
                          className="block text-xs text-red-500 hover:text-red-700"
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="flex cursor-pointer flex-col items-center justify-center py-5 text-sm text-gray-500">
                      <Upload size={20} className="mb-2" />

                      {uploading ? "Uploading..." : "Upload category image"}

                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "edit")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Featured */}
              <label className="flex cursor-pointer items-center gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={editIsFeatured}
                  onChange={(e) => setEditIsFeatured(e.target.checked)}
                  className="h-4 w-4 rounded"
                />

                <span>
                  <span className="font-medium text-gray-700">
                    Show on homepage
                  </span>

                  <span className="ml-2 text-gray-400">Featured category</span>
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                disabled={savingEdit}
                onClick={() => setEditingCategory(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={savingEdit || uploading}
                onClick={saveEditCategory}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {savingEdit && <Loader2 size={16} className="animate-spin" />}

                {savingEdit ? "Saving..." : "Save changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MOVE PRODUCTS MODAL */}
      {/* ========================================================= */}

      {movingCategory && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h3 className="font-semibold text-gray-900">Move products</h3>

                <p className="mt-1 text-xs text-gray-500">
                  Move products from{" "}
                  <span className="font-medium text-gray-900">
                    {movingCategory.name}
                  </span>{" "}
                  to another category.
                </p>
              </div>

              <button
                type="button"
                onClick={() => !movingProducts && setMovingCategory(null)}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5 p-6">
              {loadingProducts ? (
                <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Loading products...
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="rounded-xl bg-green-50 p-4 text-sm text-green-700">
                  This category has no products assigned to it. You can safely
                  delete it.
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-gray-50 p-4">
                    <p className="text-sm font-medium text-gray-900">
                      {categoryProducts.length}{" "}
                      {categoryProducts.length === 1 ? "product" : "products"}{" "}
                      will be moved.
                    </p>

                    <div className="mt-3 max-h-40 space-y-2 overflow-y-auto">
                      {categoryProducts.map((product) => (
                        <div
                          key={product.id}
                          className="flex items-center gap-3 rounded-lg bg-white p-2"
                        >
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="h-8 w-8 rounded object-cover"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded bg-gray-100" />
                          )}

                          <span className="truncate text-sm text-gray-700">
                            {product.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Move to
                    </label>

                    <select
                      value={moveTargetId}
                      onChange={(e) => setMoveTargetId(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary-ring)]"
                    >
                      <option value="">Select destination category</option>

                      {categories
                        .filter((category) => category.id !== movingCategory.id)
                        .map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t bg-gray-50 px-6 py-4">
              <button
                type="button"
                disabled={movingProducts}
                onClick={() => setMovingCategory(null)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>

              {categoryProducts.length > 0 && (
                <button
                  type="button"
                  disabled={movingProducts || loadingProducts || !moveTargetId}
                  onClick={moveProducts}
                  className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {movingProducts && (
                    <Loader2 size={16} className="animate-spin" />
                  )}

                  {movingProducts ? "Moving..." : "Move products"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
