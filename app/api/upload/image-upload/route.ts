// import cloudinary from "@/app/lib/cloudinary";

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return Response.json({ error: "No file uploaded" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadResult = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: "urban-threads/products",

          // Safety
          resource_type: "image",
          allowed_formats: ["jpg", "jpeg", "png", "webp"],

          // Do NOT resize permanently
          transformation: [{ quality: "auto", fetch_format: "auto" }],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      )
      .end(buffer);
  });

  return Response.json({
    url: uploadResult.secure_url,
  });
}

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const file = formData.get("image") as File | null;
//   console.log(file);

//   if (!file) {
//     return Response.json({ message: "No image provided" }, { status: 400 });
//   }

//   // Validate file type
//   if (!file.type.startsWith("image/")) {
//     return Response.json({ message: "Invalid file type" }, { status: 400 });
//   }

//   // Validate size (5MB)
//   const MAX_SIZE = 5 * 1024 * 1024;
//   if (file.size > MAX_SIZE) {
//     return Response.json({ message: "Image too large" }, { status: 400 });
//   }

//   // Convert to buffer
//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   // Upload to Cloudinary
//   const uploadResult = await new Promise<any>((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           folder: "urban-threads/products",
//           resource_type: "image",
//           transformation: [
//             { width: 1200, height: 1200, crop: "limit" },
//             { quality: "auto" },
//             { fetch_format: "auto" },
//           ],
//         },
//         (error, result) => {
//           if (error) reject(error);
//           resolve(result);
//         }
//       )
//       .end(buffer);
//   });

//   return Response.json({
//     url: uploadResult.secure_url,
//     publicId: uploadResult.public_id,
//   });
// }

// export async function POST(req: Request) {
//   console.log("Content-Type:", req.headers.get("content-type"));

//   const formData = await req.formData();
//   const file = formData.get("image") as File | null;

//   if (!file) {
//     return new Response("No file uploaded", { status: 400 });
//   }

//   return Response.json({ ok: true });
// }

// export async function POST(req: Request) {
//   console.log("Upload route HIT");

//   const contentType = req.headers.get("content-type");
//   console.log("Content-Type:", contentType);

//   const formData = await req.formData();
//   console.log("FormData keys:", [...formData.keys()]);

//   const file = formData.get("image") as File | null;

//   if (!file) {
//     return Response.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   return Response.json({ ok: true });
// }
