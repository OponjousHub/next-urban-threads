"use client";

import { useEffect, useState } from "react";

import { appToast } from "@/utils/appToast";

import { UploadStatus, SingleImageUploaderProps } from "@/types/image-uploader";

import UploaderDropzone from "./uploader-dropzone";
import UploaderPreview from "./uploader-preview";

export default function SingleImageUploader({
  label,
  image,
  onChange,
  height = 220,
  maxSizeMB = 5,
  acceptedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"],
}: SingleImageUploaderProps) {
  const [status, setStatus] = useState<UploadStatus>("idle");

  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (status === "success") {
      const timer = setTimeout(() => {
        setStatus("idle");
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [status]);

  async function uploadFile(file: File) {
    if (!acceptedTypes.includes(file.type)) {
      appToast.error("Unsupported image format.");

      return;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      appToast.error(`Image must not exceed ${maxSizeMB}MB.`);

      return;
    }

    try {
      setStatus("uploading");

      const formData = new FormData();

      formData.append("image", file);

      const res = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      onChange(data.url);

      setStatus("success");

      appToast.success("Image uploaded.");
    } catch (err) {
      console.error(err);

      setStatus("failed");

      appToast.error("Upload failed.");
    }
  }

  return image ? (
    <UploaderPreview
      label={label}
      image={image}
      status={status}
      height={height}
      onRemove={() => onChange(null)}
      onUpload={uploadFile}
    />
  ) : (
    <UploaderDropzone
      label={label}
      dragging={dragging}
      height={height}
      onDragChange={setDragging}
      onUpload={uploadFile}
    />
  );
}
