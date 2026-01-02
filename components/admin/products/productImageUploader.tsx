"use client";

import { useState } from "react";

export function ProductImageUploader({
  onUploadComplete,
}: {
  onUploadComplete: (images: string[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
  };

  const uploadImages = async () => {
    const uploadedImages: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      console.log(data);
      uploadedImages.push(data.url);
    }

    onUploadComplete(uploadedImages);
  };

  return (
    <div className="space-y-4">
      <input type="file" multiple accept="image/*" onChange={handleChange} />

      {/* Preview */}
      <div className="flex gap-3">
        {previews.map((src, i) => (
          <img key={i} src={src} className="h-24 w-24 object-cover rounded" />
        ))}
      </div>

      <button
        type="button"
        onClick={uploadImages}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        Upload Images
      </button>
    </div>
  );
}
