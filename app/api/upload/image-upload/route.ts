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
