"use client";

import { useEffect, useState } from "react";

type Category = {
  id: string;
  name: string;
  slug: string;
  image?: string | null;
};

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadCategories() {
    const res = await fetch("/api/admin/categories");
    const data = await res.json();
    setCategories(data);
  }

  async function createCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return alert("Category name is required");

    setLoading(true);

    let imageUrl = "";
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!,
      );

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formData,
        },
      );

      const cloudData = await cloudRes.json();
      imageUrl = cloudData.secure_url;
    }

    const res = await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, image: imageUrl }),
    });

    if (res.ok) {
      setName("");
      setFile(null);
      setLoading(false);
      loadCategories();
    } else {
      setLoading(false);
      alert("Error creating category");
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="p-8">
      <form
        onSubmit={createCategory}
        className="flex flex-col gap-4 mb-8 max-w-md"
      >
        <input
          type="text"
          placeholder="Category name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded px-4 py-2"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="border rounded px-4 py-2"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-[var(--color-primary)] text-white px-4 py-2 rounded hover:bg-[var(--color-primary-dark)] disabled:opacity-50"
        >
          {loading ? "Uploading..." : "Create Category"}
        </button>
      </form>

      <ul className="space-y-2">
        {categories.map((cat) => (
          <li key={cat.id} className="flex items-center gap-4">
            <span>{cat.name}</span>
            {cat.image && (
              <img
                src={cat.image}
                alt={cat.name}
                className="w-12 h-12 object-cover rounded"
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
