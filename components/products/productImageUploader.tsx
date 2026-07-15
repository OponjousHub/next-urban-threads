"use client";

import Image from "next/image";
import { RefreshCcw, X, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useState, useEffect, useRef } from "react";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableImage } from "./sortable-image";
import { appToast } from "@/utils/appToast";

type Props = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
};

type UploadStatus = "queued" | "uploading" | "success" | "failed";

type UploadItem = {
  id: string;
  file: File;
  preview: string;
  status: UploadStatus;
  uploadedUrl?: string;
};

export function ProductImageUploader({ images, setImages }: Props) {
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const uploadControllers = useRef<Record<string, AbortController>>({});

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "queued",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    uploadQueue(newItems);
  }

  // Add single file upload function
  async function uploadSingle(item: UploadItem) {
    try {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: "uploading",
              }
            : q,
        ),
      );

      const formData = new FormData();

      formData.append("image", item.file);

      const response = await fetch("/api/upload/image-upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      const uploadedUrl = data.url;

      setImages((prev) => [...prev, uploadedUrl]);

      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: "success",
                uploadedUrl,
              }
            : q,
        ),
      );
    } catch (error) {
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: "failed",
              }
            : q,
        ),
      );
    }
  }

  // Add Queue processor
  async function uploadQueue(items: UploadItem[]) {
    toast.loading("Uploading images...", {
      id: "upload-queue",
    });

    for (const item of items) {
      await uploadSingle(item);
    }

    toast.success("Uploads completed", {
      id: "upload-queue",
    });
  }

  // Add retry failed upload
  function retryUpload(id: string) {
    const item = queue.find((q) => q.id === id);

    if (!item) return;

    uploadSingle(item);
  }

  // Add remove queue item
  function removeQueueItem(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.indexOf(active.id);

      const newIndex = items.indexOf(over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
  }

  // Cancel Upload function
  function cancelUpload(id: string) {
    uploadControllers.current[id]?.abort();

    setQueue((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: "failed" } : q)),
    );
  }

  return (
    <div className="space-y-5">
      {/* IMAGE GRID */}
      {images.length > 0 && (
        <DndContext
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={images} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <SortableImage
                  key={img}
                  id={img}
                  image={img}
                  onRemove={() =>
                    setImages((prev) => prev.filter((i) => i !== img))
                  }
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Adding queue UI*/}
      {queue.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-gray-700">Upload Queue</h3>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 border rounded-xl p-3 bg-white"
              >
                <Image
                  src={item.preview}
                  alt=""
                  width={60}
                  height={60}
                  className="w-14 h-14 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm truncate">{item.file.name}</p>

                  <p className="text-xs text-gray-500">
                    {item.status === "queued" && "Waiting in queue"}

                    {item.status === "uploading" && "Uploading..."}

                    {item.status === "success" && "Upload successful"}

                    {item.status === "failed" && "Upload failed"}
                  </p>
                </div>

                {/*Upload Cancel button*/}
                {item.status === "uploading" && (
                  <button
                    onClick={() => cancelUpload(item.id)}
                    className="text-red-500"
                  >
                    Cancel
                  </button>
                )}

                {item.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => retryUpload(item.id)}
                    className="text-orange-600"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => removeQueueItem(item.id)}
                  className="text-red-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPLOAD BUTTON */}
      <label className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
        <Upload className="w-8 h-8 mb-3 text-gray-500" />

        <span className="text-sm text-gray-600">
          Click to upload product images
        </span>

        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          onChange={handleSelectFiles}
        />
      </label>
    </div>
  );
}
