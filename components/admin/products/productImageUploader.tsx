"use client";

import Image from "next/image";
import { Trash2, Upload } from "lucide-react";
import toast from "react-hot-toast";

interface Props {
  initialImages?: string[];
  onUploadComplete: (urls: string[]) => void;
}

export function ProductImageUploader({
  initialImages = [],
  onUploadComplete,
}: Props) {
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    const toastId = toast.loading("Uploading images...");

    try {
      const uploaded: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();

        formData.append("file", file);

        const response = await fetch("/api/upload/image-upload", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();
        console.log("UPLOAD RESPONSE", data);

        uploaded.push(data.url);
      }

      onUploadComplete(
        [...initialImages, ...uploaded].filter(
          (img) => img && img.trim() !== "",
        ),
      );

      toast.success("Images uploaded successfully", {
        id: toastId,
      });
    } catch (err) {
      toast.error("Upload failed", {
        id: toastId,
      });
    }
  }

  function removeImage(index: number) {
    const updated = initialImages.filter((_, i) => i !== index);

    onUploadComplete(updated);
  }

  return (
    <div className="space-y-5">
      {/* IMAGE GRID */}
      {initialImages.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {initialImages
            .filter((img) => img && img.trim() !== "")
            .map((img, index) => (
              <div
                key={index}
                className="relative border rounded-2xl overflow-hidden bg-white"
              >
                <Image
                  src={img}
                  alt=""
                  width={300}
                  height={300}
                  className="w-full h-40 object-cover"
                />

                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-white/90 hover:bg-white p-2 rounded-full shadow"
                >
                  ✕
                </button>
              </div>
            ))}
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
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}

// "use client";

// import { useState, useEffect, useRef } from "react";
// import toast from "react-hot-toast";
// import { AdminToast } from "@/components/ui/adminToast";

// interface ProductImageUploaderProps {
//   onUploadComplete: (images: string[]) => void;
//   initialImages?: string[];
// }

// export function ProductImageUploader({
//   onUploadComplete,
//   initialImages = [],
// }: ProductImageUploaderProps) {
//   const [files, setFiles] = useState<File[]>([]);
//   const [previews, setPreviews] = useState<string[]>([]);
//   const [uploading, setUploading] = useState(false);

//   // ✅ Prevent infinite loop
//   const initialized = useRef(false);

//   // ✅ Run ONLY ONCE when initialImages is ready
//   useEffect(() => {
//     if (!initialized.current && initialImages.length) {
//       setPreviews(initialImages);
//       initialized.current = true;
//     }
//   }, [initialImages]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const selectedFiles = Array.from(e.target.files || []);
//     setFiles(selectedFiles);

//     const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));

//     setPreviews((prev) => [...prev, ...previewUrls]);
//   };

//   const uploadImages = async () => {
//     if (!files.length) {
//       toast.custom(
//         <AdminToast
//           type="error"
//           title="No images selected"
//           description="Please choose at least one image to upload"
//         />,
//         { duration: 6000 },
//       );
//       return;
//     }

//     const uploadedImages: string[] = [];
//     setUploading(true);
//     const toastId = toast.loading("Uploading images...");

//     try {
//       for (const file of files) {
//         const formData = new FormData();
//         formData.append("image", file);

//         const res = await fetch("/api/upload/image-upload", {
//           method: "POST",
//           body: formData,
//         });

//         if (!res.ok) throw new Error("Upload failed");

//         const data = await res.json();
//         uploadedImages.push(data.url);
//       }

//       // ✅ Keep existing + new uploaded
//       const existingImages = previews.filter((p) => p.startsWith("http"));
//       const finalImages = [...existingImages, ...uploadedImages];

//       setPreviews(finalImages);
//       onUploadComplete(finalImages);

//       toast.custom(
//         <AdminToast
//           title="Images uploaded"
//           description={`${uploadedImages.length} image(s) uploaded successfully`}
//         />,
//         { duration: 6000 },
//       );

//       setFiles([]);
//     } catch (error) {
//       console.error(error);
//       toast.custom(
//         <AdminToast
//           type="error"
//           title="Upload failed"
//           description="One or more images could not be uploaded"
//         />,
//         { duration: 6000 },
//       );
//     } finally {
//       toast.dismiss(toastId);
//       setUploading(false);
//     }
//   };

//   return (
//     <div className="space-y-4">
//       <input type="file" multiple accept="image/*" onChange={handleChange} />

//       {/* Preview */}
//       <div className="flex gap-3 flex-wrap">
//         {previews.map((src, i) => (
//           <img
//             key={i}
//             src={src}
//             className="h-24 w-24 object-cover rounded-lg border"
//           />
//         ))}
//       </div>

//       <button
//         type="button"
//         disabled={uploading || !files.length}
//         onClick={uploadImages}
//         className="bg-[var(--color-primary)] text-white px-4 py-2 rounded-md
//                    hover:bg-[var(--color-primary-dark)]transition disabled:opacity-60"
//       >
//         {uploading ? "Uploading..." : "Upload Images"}
//       </button>
//     </div>
//   );
// }
