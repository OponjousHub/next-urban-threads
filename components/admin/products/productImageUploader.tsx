"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";

export function ProductImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: (images: string[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const uploadImages = async () => {
    if (!files.length) {
      toast.custom(
        <AdminToast
          type="error"
          title="No images selected"
          description="Please choose at least one image to upload"
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        },
      );
      return;
    }

    const uploadedImages: string[] = [];
    setUploading(true);

    // 🔄 Loading toast
    const toastId = toast.loading("Uploading images...");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload/image-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          throw new Error("Image upload failed");
        }

        const data = await res.json();
        uploadedImages.push(data.url);
      }

      onUploadComplete(uploadedImages);

      // ✅ Success toast
      toast.custom(
        <AdminToast
          title="Images uploaded"
          description={`${uploadedImages.length} image(s) uploaded successfully`}
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        },
      );
    } catch (error) {
      console.error(error);

      // ❌ Error toast
      toast.custom(
        <AdminToast
          type="error"
          title="Upload failed"
          description="One or more images could not be uploaded"
        />,
        {
          duration: 6000, // ⏱️ 8 seconds
        },
      );
    } finally {
      toast.dismiss(toastId);
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input type="file" multiple accept="image/*" onChange={handleChange} />

      {/* Preview */}
      <div className="flex gap-3 flex-wrap">
        {previews.map((src, i) => (
          <img
            key={i}
            src={src}
            className="h-24 w-24 object-cover rounded-lg border"
          />
        ))}
      </div>

      <button
        type="button"
        disabled={uploading}
        onClick={uploadImages}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md
                   hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>
    </div>
  );
}
