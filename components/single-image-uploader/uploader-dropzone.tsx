"use client";

import { UploadCloud } from "lucide-react";

type Props = {
  label: string;
  dragging: boolean;
  height: number;

  onDragChange: (dragging: boolean) => void;

  onUpload: (file: File) => void;
};

export default function UploaderDropzone({
  label,
  dragging,
  height,
  onDragChange,
  onUpload,
}: Props) {
  function handleFile(file?: File) {
    if (!file) return;

    onUpload(file);
  }

  return (
    <div
      style={{ height }}
      onDragOver={(e) => {
        e.preventDefault();
        onDragChange(true);
      }}
      onDragLeave={() => onDragChange(false)}
      onDrop={(e) => {
        e.preventDefault();

        onDragChange(false);

        handleFile(e.dataTransfer.files?.[0]);
      }}
      className={`
        relative
        overflow-hidden
        rounded-2xl
        border-2
        border-dashed
        transition-all
        duration-300

        ${
          dragging
            ? "border-[var(--color-primary)] bg-blue-50"
            : "border-gray-300 bg-gray-50 hover:border-[var(--color-primary)] hover:bg-gray-100"
        }
      `}
    >
      <label className="absolute inset-0 flex cursor-pointer flex-col items-center justify-center px-6 text-center">
        <UploadCloud
          className={`
            mb-5
            h-12
            w-12
            transition-all

            ${
              dragging
                ? "scale-110 text-[var(--color-primary)]"
                : "text-gray-400"
            }
          `}
        />

        <h3 className="mb-2 text-lg font-semibold text-gray-800">{label}</h3>

        <p className="text-sm text-gray-500">
          {dragging ? "Release to upload" : "Drag & drop an image here"}
        </p>

        <span className="my-4 text-gray-400">or</span>

        <span className="rounded-xl bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-gray-800">
          Choose Image
        </span>

        <p className="mt-5 text-xs text-gray-400">PNG • JPG • JPEG • WEBP</p>

        <input
          hidden
          type="file"
          accept="image/*"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </label>
    </div>
  );
}
