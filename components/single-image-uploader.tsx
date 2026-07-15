"use client";

import Image from "next/image";
import { Upload, RefreshCcw, Trash2 } from "lucide-react";
import { useState } from "react";
import { appToast } from "@/utils/appToast";
// import toast from "react-hot-toast";

type UploadStatus = "idle" | "uploading" | "success" | "failed";

type Props = {
  image: string | null;
  onChange: (url: string | null) => void;
  label: string;
  aspect?: "square" | "banner";
};

export default function SingleImageUploader({
  image,
  onChange,
  label,
  aspect = "square",
}: Props) {
  const [status, setStatus] = useState<UploadStatus>("idle");

  const [preview, setPreview] = useState(image);

  async function handleFile(file: File) {
    try {
      setStatus("uploading");

      const localPreview = URL.createObjectURL(file);

      setPreview(localPreview);

      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const data = await res.json();

      onChange(data.url);

      setPreview(data.url);

      setStatus("success");

      appToast.success("Success", "Image updated successfully");
    } catch (err) {
      setStatus("failed");

      appToast.error("Failed", "Upload failed");
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">{label}</h3>

      <div
        className={`
          relative
          overflow-hidden
          rounded-2xl
          border-2
          border-dashed
          border-gray-300
          bg-gray-50

          ${aspect === "banner" ? "h-56" : "h-64"}
        `}
      >
        {preview ? (
          <>
            <Image src={preview} alt={label} fill className="object-cover" />

            <div className="absolute inset-0 bg-black/45 opacity-0 hover:opacity-100 transition flex items-center justify-center gap-3">
              <label className="cursor-pointer rounded-xl bg-white px-4 py-2 font-medium shadow hover:bg-gray-100">
                Replace
                <input
                  hidden
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];

                    if (file) handleFile(file);
                  }}
                />
              </label>

              <button
                type="button"
                onClick={() => {
                  setPreview(null);

                  onChange(null);

                  appToast.success("Success", `${label} removed`);
                }}
                className="rounded-xl bg-red-600 p-3 text-white hover:bg-red-700"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </>
        ) : (
          <label className="flex h-full cursor-pointer flex-col items-center justify-center">
            {status === "uploading" ? (
              <>
                <RefreshCcw className="mb-4 h-10 w-10 animate-spin text-[var(--color-primary)]" />

                <p className="text-sm text-gray-600">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="mb-4 h-10 w-10 text-gray-500" />

                <p className="font-medium">Upload {label}</p>

                <p className="mt-1 text-sm text-gray-500">PNG, JPG or WEBP</p>
              </>
            )}

            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];

                if (file) handleFile(file);
              }}
            />
          </label>
        )}
      </div>

      {aspect === "square" ? (
        <p className="text-xs text-gray-500">Recommended: 512 × 512 px</p>
      ) : (
        <p className="text-xs text-gray-500">Recommended: 1600 × 500 px</p>
      )}
    </div>
  );
}
