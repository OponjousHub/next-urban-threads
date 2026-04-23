"use client";

import { useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";

type FormData = {
  aboutTitle?: string;
  aboutDescription?: string;
  aboutStory?: string;
  aboutImage?: string;
};

export default function AboutSettings() {
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset, setValue, watch } =
    useForm<FormData>();

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/admin/about");
      const data = await res.json();

      reset(data);
    }

    load();
  }, [reset]);

  async function onSubmit(data: FormData) {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/about", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error();

      toast.success("About page updated");
    } catch {
      toast.error("Failed to update About page");
    } finally {
      setLoading(false);
    }
  }

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

      // ✅ IMPORTANT: store in form
      setValue("aboutImage", data.url, { shouldDirty: true });

      toast.custom(
        <AdminToast
          type="success"
          title="Upload successful"
          description="Image uploaded"
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

  const image = watch("aboutImage");

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="bg-white p-6 rounded-2xl border space-y-6">
        <h2 className="text-lg font-semibold">About Page</h2>

        {/* TITLE */}
        <div>
          <label className="text-sm font-medium">Title</label>
          <input
            {...register("aboutTitle")}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">Short Description</label>
          <textarea
            {...register("aboutDescription")}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* STORY */}
        <div>
          <label className="text-sm font-medium">Full Story</label>
          <textarea
            {...register("aboutStory")}
            rows={6}
            className="mt-1 w-full border px-3 py-2 rounded-lg"
          />
        </div>

        {/* HERO IMAGE */}

        <div className="border-2 border-dashed rounded-xl p-6 text-center">
          {!image ? (
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
              <img src={image} className="h-20 rounded border" />

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
                onClick={() =>
                  setValue("aboutImage", "", { shouldDirty: true })
                }
                className="text-xs text-red-500"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-black text-white px-5 py-2 rounded-md"
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
