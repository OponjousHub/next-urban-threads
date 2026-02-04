import { uploadImageToCloudinary } from "@/app/lib/uploadToCloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("image") as File | null;

  if (!file) {
    return Response.json({ error: "No file uploaded!" }, { status: 400 });
  }

  const result = await uploadImageToCloudinary(file, "urban-threads/products");

  return Response.json({
    url: result.secure_url,
  });
}

// import { v2 as cloudinary } from "cloudinary";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_NAME!,
//   api_key: process.env.CLOUDINARY_API_KEY!,
//   api_secret: process.env.CLOUDINARY_API_SECRET!,
// });

// export async function POST(req: Request) {
//   const formData = await req.formData();
//   const file = formData.get("image") as File | null;

//   if (!file) {
//     return Response.json({ error: "No file uploaded" }, { status: 400 });
//   }

//   const bytes = await file.arrayBuffer();
//   const buffer = Buffer.from(bytes);

//   const uploadResult = await new Promise<any>((resolve, reject) => {
//     cloudinary.uploader
//       .upload_stream(
//         {
//           folder: "urban-threads/products",

//           // Safety
//           resource_type: "image",
//           allowed_formats: ["jpg", "jpeg", "png", "webp"],

//           // Do NOT resize permanently
//           transformation: [{ quality: "auto", fetch_format: "auto" }],
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         },
//       )
//       .end(buffer);
//   });

//   return Response.json({
//     url: uploadResult.secure_url,
//   });
// }
