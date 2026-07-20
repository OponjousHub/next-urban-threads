"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";

import { UploadStatus } from "@/types/image-uploader";

import UploaderOverlay from "./uploader-overlay";

type Props = {
  label: string;
  image: string;
  status: UploadStatus;
  height: number;

  onRemove: () => void;

  onUpload: (file: File) => void;
};

export default function UploaderPreview({
  label,
  image,
  status,
  height,
  onRemove,
  onUpload,
}: Props) {
  function handleFile(file?: File) {
    if (!file) return;

    onUpload(file);
  }

  return (
    <div
      style={{ height }}
      className="group relative overflow-hidden rounded-2xl border bg-white shadow-sm"
    >
      {/* Image */}
      <Image
        src={image}
        alt={label}
        fill
        className="object-cover transition duration-300 group-hover:scale-105"
      />

      {/* Upload / Success / Failed overlay */}
      <UploaderOverlay status={status} />

      {/* Hover Actions */}
      <div
        className={`
          absolute inset-0
          flex items-center justify-center gap-3
          bg-black/45
          transition-opacity duration-300

          ${
            status === "idle"
              ? "opacity-0 group-hover:opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
      >
        {/* Replace */}
        <label className="cursor-pointer rounded-xl bg-white px-5 py-2 text-sm font-medium shadow transition hover:bg-gray-100">
          Replace
          <input
            hidden
            type="file"
            accept="image/*"
            disabled={status !== "idle"}
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
        </label>

        {/* Delete */}
        <button
          type="button"
          disabled={status !== "idle"}
          onClick={onRemove}
          className="rounded-xl bg-red-600 p-3 text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}
