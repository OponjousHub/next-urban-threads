// "use client";

// import Image from "next/image";
// import { RefreshCcw, X, Upload } from "lucide-react";
// import toast from "react-hot-toast";
// import { DndContext, closestCenter } from "@dnd-kit/core";
// import { useState, useEffect, useRef } from "react";
// import {
//   SortableContext,
//   rectSortingStrategy,
//   arrayMove,
// } from "@dnd-kit/sortable";
// import { SortableImage } from "./sortable-image";
// import { appToast } from "@/utils/appToast";

// type Props = {
//   images: string[];
//   setImages: React.Dispatch<React.SetStateAction<string[]>>;
// };

// type UploadStatus = "queued" | "uploading" | "success" | "failed";

// type UploadItem = {
//   id: string;
//   file: File;
//   preview: string;
//   status: UploadStatus;
//   uploadedUrl?: string;
// };

// export function ProductImageUploader({ images, setImages }: Props) {
//   const [queue, setQueue] = useState<UploadItem[]>([]);
//   const uploadControllers = useRef<Record<string, AbortController>>({});

//   function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
//     const files = e.target.files;

//     if (!files || files.length === 0) return;

//     const newItems: UploadItem[] = Array.from(files).map((file) => ({
//       id: crypto.randomUUID(),
//       file,
//       preview: URL.createObjectURL(file),
//       status: "queued",
//     }));

//     setQueue((prev) => [...prev, ...newItems]);

//     uploadQueue(newItems);
//   }

//   // Add single file upload function
//   async function uploadSingle(item: UploadItem) {
//     try {
//       setQueue((prev) =>
//         prev.map((q) =>
//           q.id === item.id
//             ? {
//                 ...q,
//                 status: "uploading",
//               }
//             : q,
//         ),
//       );

//       const formData = new FormData();

//       formData.append("image", item.file);

//       const response = await fetch("/api/upload/image-upload", {
//         method: "POST",
//         body: formData,
//       });

//       if (!response.ok) {
//         throw new Error("Upload failed");
//       }

//       const data = await response.json();

//       const uploadedUrl = data.url;

//       setImages((prev) => [...prev, uploadedUrl]);

//       setQueue((prev) =>
//         prev.map((q) =>
//           q.id === item.id
//             ? {
//                 ...q,
//                 status: "success",
//                 uploadedUrl,
//               }
//             : q,
//         ),
//       );
//     } catch (error) {
//       setQueue((prev) =>
//         prev.map((q) =>
//           q.id === item.id
//             ? {
//                 ...q,
//                 status: "failed",
//               }
//             : q,
//         ),
//       );
//     }
//   }

//   // Add Queue processor
//   async function uploadQueue(items: UploadItem[]) {
//     toast.loading("Uploading images...", {
//       id: "upload-queue",
//     });

//     for (const item of items) {
//       await uploadSingle(item);
//     }

//     toast.success("Uploads completed", {
//       id: "upload-queue",
//     });
//   }

//   // Add retry failed upload
//   function retryUpload(id: string) {
//     const item = queue.find((q) => q.id === id);

//     if (!item) return;

//     uploadSingle(item);
//   }

//   // Add remove queue item
//   function removeQueueItem(id: string) {
//     setQueue((prev) => prev.filter((q) => q.id !== id));
//   }

//   function handleDragEnd(event: any) {
//     const { active, over } = event;

//     if (!over || active.id === over.id) return;

//     setImages((items) => {
//       const oldIndex = items.indexOf(active.id);

//       const newIndex = items.indexOf(over.id);

//       return arrayMove(items, oldIndex, newIndex);
//     });
//   }

//   // Cancel Upload function
//   function cancelUpload(id: string) {
//     uploadControllers.current[id]?.abort();

//     setQueue((prev) =>
//       prev.map((q) => (q.id === id ? { ...q, status: "failed" } : q)),
//     );
//   }

//   return (
//     <div className="space-y-5">
//       {/* IMAGE GRID */}
//       {images.length > 0 && (
//         <DndContext
//           collisionDetection={closestCenter}
//           onDragEnd={handleDragEnd}
//         >
//           <SortableContext items={images} strategy={rectSortingStrategy}>
//             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//               {images.map((img) => (
//                 <SortableImage
//                   key={img}
//                   id={img}
//                   image={img}
//                   onRemove={() =>
//                     setImages((prev) => prev.filter((i) => i !== img))
//                   }
//                 />
//               ))}
//             </div>
//           </SortableContext>
//         </DndContext>
//       )}

//       {/* Adding queue UI*/}
//       {queue.length > 0 && (
//         <div className="space-y-3">
//           <h3 className="text-sm font-medium text-gray-700">Upload Queue</h3>

//           <div className="space-y-2">
//             {queue.map((item) => (
//               <div
//                 key={item.id}
//                 className="flex items-center gap-3 border rounded-xl p-3 bg-white"
//               >
//                 <Image
//                   src={item.preview}
//                   alt=""
//                   width={60}
//                   height={60}
//                   className="w-14 h-14 object-cover rounded-lg"
//                 />
//                 <div className="flex-1">
//                   <p className="text-sm truncate">{item.file.name}</p>

//                   <p className="text-xs text-gray-500">
//                     {item.status === "queued" && "Waiting in queue"}

//                     {item.status === "uploading" && "Uploading..."}

//                     {item.status === "success" && "Upload successful"}

//                     {item.status === "failed" && "Upload failed"}
//                   </p>
//                 </div>

//                 {/*Upload Cancel button*/}
//                 {item.status === "uploading" && (
//                   <button
//                     onClick={() => cancelUpload(item.id)}
//                     className="text-red-500"
//                   >
//                     Cancel
//                   </button>
//                 )}

//                 {item.status === "failed" && (
//                   <button
//                     type="button"
//                     onClick={() => retryUpload(item.id)}
//                     className="text-orange-600"
//                   >
//                     <RefreshCcw className="w-5 h-5" />
//                   </button>
//                 )}

//                 <button
//                   type="button"
//                   onClick={() => removeQueueItem(item.id)}
//                   className="text-red-500"
//                 >
//                   <X className="w-5 h-5" />
//                 </button>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* UPLOAD BUTTON */}
//       <label className="border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer hover:border-black transition">
//         <Upload className="w-8 h-8 mb-3 text-gray-500" />

//         <span className="text-sm text-gray-600">
//           Click to upload product images
//         </span>

//         <input
//           type="file"
//           multiple
//           hidden
//           accept="image/*"
//           onChange={handleSelectFiles}
//         />
//       </label>
//     </div>
//   );
// }
"use client";

import Image from "next/image";
import {
  RefreshCcw,
  X,
  Upload,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import { useState, useRef } from "react";
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

  /*
   * ---------------------------------------------------------
   * HELPERS
   * ---------------------------------------------------------
   */

  const isUploading = queue.some((item) => item.status === "uploading");

  /*
   * ---------------------------------------------------------
   * SELECT FILES
   * ---------------------------------------------------------
   */

  function handleSelectFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) {
      return;
    }

    const newItems: UploadItem[] = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      file,
      preview: URL.createObjectURL(file),
      status: "queued",
    }));

    setQueue((prev) => [...prev, ...newItems]);

    uploadQueue(newItems);

    /*
     * Allows selecting the same file again
     * after an upload.
     */
    e.target.value = "";
  }

  /*
   * ---------------------------------------------------------
   * SINGLE IMAGE UPLOAD
   * ---------------------------------------------------------
   */

  async function uploadSingle(item: UploadItem) {
    const controller = new AbortController();

    uploadControllers.current[item.id] = controller;

    try {
      /*
       * Mark item as uploading.
       */
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
        signal: controller.signal,
      });

      /*
       * Handle HTTP failure.
       */
      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const data = await response.json();

      if (!data?.url) {
        throw new Error("Upload failed: image URL missing");
      }

      const uploadedUrl = data.url;

      /*
       * Add uploaded image to product images.
       */
      setImages((prev) => [...prev, uploadedUrl]);

      /*
       * Mark upload as successful.
       */
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
    } catch (error: any) {
      /*
       * Don't show an error toast when the user
       * intentionally cancelled the upload.
       */
      if (error?.name === "AbortError") {
        return;
      }

      console.error("Image upload failed:", error);

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
    } finally {
      delete uploadControllers.current[item.id];
    }
  }

  /*
   * ---------------------------------------------------------
   * UPLOAD QUEUE
   * ---------------------------------------------------------
   */

  async function uploadQueue(items: UploadItem[]) {
    /*
     * Upload sequentially so we don't send
     * many large images to Cloudinary at once.
     */
    for (const item of items) {
      await uploadSingle(item);
    }

    /*
     * Check whether anything failed.
     *
     * We wait a little for React state to settle,
     * then determine the result from the queue.
     */
    setTimeout(() => {
      setQueue((currentQueue) => {
        const uploadedItems = currentQueue.filter((item) =>
          items.some((newItem) => newItem.id === item.id),
        );

        const hasFailed = uploadedItems.some(
          (item) => item.status === "failed",
        );

        const allFinished = uploadedItems.every(
          (item) => item.status === "success" || item.status === "failed",
        );

        if (allFinished) {
          if (hasFailed) {
            appToast.error("Upload issue", "Some images could not be uploaded");
          } else {
            appToast.success("Success", "Images uploaded successfully");
          }
        }

        return currentQueue;
      });
    }, 100);
  }

  /*
   * ---------------------------------------------------------
   * RETRY
   * ---------------------------------------------------------
   */

  function retryUpload(id: string) {
    const item = queue.find((q) => q.id === id);

    if (!item) return;

    uploadSingle(item);
  }

  /*
   * ---------------------------------------------------------
   * REMOVE QUEUE ITEM
   * ---------------------------------------------------------
   */

  function removeQueueItem(id: string) {
    const item = queue.find((q) => q.id === id);

    /*
     * Don't allow removing an actively
     * uploading item except through Cancel.
     */
    if (item?.status === "uploading") {
      return;
    }

    if (item?.preview) {
      URL.revokeObjectURL(item.preview);
    }

    setQueue((prev) => prev.filter((q) => q.id !== id));
  }

  /*
   * ---------------------------------------------------------
   * CANCEL UPLOAD
   * ---------------------------------------------------------
   */

  function cancelUpload(id: string) {
    uploadControllers.current[id]?.abort();

    setQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: "failed",
            }
          : q,
      ),
    );

    appToast.warning("Upload cancelled", "The image upload was cancelled");
  }

  /*
   * ---------------------------------------------------------
   * DRAG & DROP
   * ---------------------------------------------------------
   */

  function handleDragEnd(event: any) {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    setImages((items) => {
      const oldIndex = items.indexOf(active.id);

      const newIndex = items.indexOf(over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return items;
      }

      return arrayMove(items, oldIndex, newIndex);
    });
  }

  /*
   * ---------------------------------------------------------
   * RENDER
   * ---------------------------------------------------------
   */

  return (
    <div className="space-y-6">
      {/* =====================================================
          CURRENT PRODUCT IMAGES
          ===================================================== */}

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

      {/* =====================================================
          UPLOAD QUEUE
          ===================================================== */}

      {queue.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800">
              Upload Queue
            </h3>

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Uploading images...</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            {queue.map((item) => (
              <div
                key={item.id}
                className="
                    flex
                    items-center
                    gap-3
                    border
                    border-gray-200
                    rounded-xl
                    p-3
                    bg-white
                    shadow-sm
                  "
              >
                {/* Preview */}
                <Image
                  src={item.preview}
                  alt=""
                  width={60}
                  height={60}
                  className="
                      w-14
                      h-14
                      object-cover
                      rounded-lg
                      border
                    "
                />

                {/* File information */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-gray-800">
                    {item.file.name}
                  </p>

                  {/* QUEUED */}
                  {item.status === "queued" && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />

                      <p className="text-xs text-gray-500">Waiting in queue</p>
                    </div>
                  )}

                  {/* UPLOADING */}
                  {item.status === "uploading" && (
                    <div className="flex items-center gap-2 mt-1">
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-700" />

                      <p className="text-xs font-medium text-gray-700">
                        Uploading...
                      </p>
                    </div>
                  )}

                  {/* SUCCESS */}
                  {item.status === "success" && (
                    <div className="flex items-center gap-2 mt-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />

                      <p className="text-xs font-medium text-green-600">
                        Upload successful
                      </p>
                    </div>
                  )}

                  {/* FAILED */}
                  {item.status === "failed" && (
                    <div className="flex items-center gap-2 mt-1">
                      <AlertCircle className="h-3.5 w-3.5 text-red-500" />

                      <p className="text-xs font-medium text-red-500">
                        Upload failed
                      </p>
                    </div>
                  )}
                </div>

                {/* CANCEL */}
                {item.status === "uploading" && (
                  <button
                    type="button"
                    onClick={() => cancelUpload(item.id)}
                    className="
                        text-xs
                        font-medium
                        text-red-500
                        hover:text-red-700
                        transition
                      "
                  >
                    Cancel
                  </button>
                )}

                {/* RETRY */}
                {item.status === "failed" && (
                  <button
                    type="button"
                    onClick={() => retryUpload(item.id)}
                    className="
                        flex
                        items-center
                        justify-center
                        h-8
                        w-8
                        rounded-lg
                        text-orange-600
                        hover:bg-orange-50
                        transition
                      "
                    title="Retry upload"
                  >
                    <RefreshCcw className="w-4 h-4" />
                  </button>
                )}

                {/* REMOVE */}
                {item.status !== "uploading" && (
                  <button
                    type="button"
                    onClick={() => removeQueueItem(item.id)}
                    className="
                        flex
                        items-center
                        justify-center
                        h-8
                        w-8
                        rounded-lg
                        text-gray-400
                        hover:text-red-500
                        hover:bg-red-50
                        transition
                      "
                    title="Remove"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =====================================================
          UPLOAD BUTTON
          ===================================================== */}

      <label
        className={`
          group
          border-2
          border-dashed
          rounded-2xl
          p-10
          flex
          flex-col
          items-center
          justify-center
          transition
          ${
            isUploading
              ? "border-gray-200 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-black hover:bg-gray-50 cursor-pointer"
          }
        `}
      >
        {isUploading ? (
          <>
            <Loader2
              className="
                w-8
                h-8
                mb-3
                text-gray-700
                animate-spin
              "
            />

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Uploading...
              </span>
            </div>

            <span className="text-xs text-gray-400 mt-1">
              Please wait while your images are uploaded
            </span>
          </>
        ) : (
          <>
            <Upload
              className="
                w-8
                h-8
                mb-3
                text-gray-500
                group-hover:text-gray-900
                transition
              "
            />

            <span className="text-sm font-medium text-gray-700">
              Click to upload product images
            </span>

            <span className="text-xs text-gray-400 mt-1">
              You can select multiple images
            </span>
          </>
        )}

        <input
          type="file"
          multiple
          hidden
          accept="image/*"
          disabled={isUploading}
          onChange={handleSelectFiles}
        />
      </label>
    </div>
  );
}
