"use client";

import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useState, useEffect } from "react";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { SortableImage } from "./sortable-image";

// interface Props {
//   initialImages?: string[];
//   onUploadComplete: (urls: string[]) => void;
// }

type Props = {
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
};

export function ProductImageUploader({ images, setImages }: Props) {
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const toastId = toast.loading("Uploading images...");

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append("image", file);

        const response = await fetch("/api/upload/image-upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("UPLOAD RESPONSE", data);

        uploaded.push(data.url);
      }

      // onUploadComplete(
      //   [...initialImages, ...uploaded].filter(
      //     (img) => img && img.trim() !== "",
      //   ),
      // );

      toast.success("Images uploaded successfully", {
        id: toastId,
      });
    } catch (err) {
      toast.error("Upload failed", {
        id: toastId,
      });
    }
  }

  // function removeImage(index: number) {
  //   const updated = initialImages.filter((_, i) => i !== index);

  //   onUploadComplete(updated);
  // }

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setImages((items) => {
      const oldIndex = items.indexOf(active.id);

      const newIndex = items.indexOf(over.id);

      return arrayMove(items, oldIndex, newIndex);
    });
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
        // <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        //   {initialImages
        //     .filter((img) => img && img.trim() !== "")
        //     .map((img, index) => (
        //       <div
        //         key={index}
        //         className="relative border rounded-2xl overflow-hidden bg-white"
        //       >
        //         <Image
        //           src={img}
        //           alt=""
        //           width={300}
        //           height={300}
        //           className="w-full h-40 object-cover"
        //         />

        //         <button
        //           type="button"
        //           onClick={() => removeImage(index)}
        //           className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
        //         >
        //           ✕
        //         </button>
        //       </div>
        //     ))}
        // </div>
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
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}
