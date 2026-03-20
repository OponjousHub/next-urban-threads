"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { AdminToast } from "@/components/ui/adminToast";

interface ProductImageUploaderProps {
  onUploadComplete: (images: string[]) => void;
  initialImages?: string[];
}

export function ProductImageUploader({
  onUploadComplete,
  initialImages = [],
}: ProductImageUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // ✅ Prevent infinite loop
  const initialized = useRef(false);

  // ✅ Run ONLY ONCE when initialImages is ready
  useEffect(() => {
    if (!initialized.current && initialImages.length) {
      setPreviews(initialImages);
      initialized.current = true;
    }
  }, [initialImages]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

    setPreviews((prev) => [...prev, ...previewUrls]);
  };

  const uploadImages = async () => {
    if (!files.length) {
      toast.custom(
        <AdminToast
          type="error"
          title="No images selected"
          description="Please choose at least one image to upload"
        />,
        { duration: 6000 },
      );
      return;
    }

    const uploadedImages: string[] = [];
    setUploading(true);
    const toastId = toast.loading("Uploading images...");

    try {
      for (const file of files) {
        const formData = new FormData();
        formData.append("image", file);

        const res = await fetch("/api/upload/image-upload", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("Upload failed");

        const data = await res.json();
        uploadedImages.push(data.url);
      }

      // ✅ Keep existing + new uploaded
      const existingImages = previews.filter((p) => p.startsWith("http"));
      const finalImages = [...existingImages, ...uploadedImages];

      setPreviews(finalImages);
      onUploadComplete(finalImages);

      toast.custom(
        <AdminToast
          title="Images uploaded"
          description={`${uploadedImages.length} image(s) uploaded successfully`}
        />,
        { duration: 6000 },
      );

      setFiles([]);
    } catch (error) {
      console.error(error);
      toast.custom(
        <AdminToast
          type="error"
          title="Upload failed"
          description="One or more images could not be uploaded"
        />,
        { duration: 6000 },
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
        disabled={uploading || !files.length}
        onClick={uploadImages}
        className="bg-indigo-600 text-white px-4 py-2 rounded-md
                   hover:bg-indigo-700 transition disabled:opacity-60"
      >
        {uploading ? "Uploading..." : "Upload Images"}
      </button>
    </div>
  );
}
