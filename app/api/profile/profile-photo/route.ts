import { uploadImageToCloudinary } from "@/app/lib/uploadToCloudinary";

export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return Response.json({ error: "No file" }, { status: 400 });
  }

  const result = await uploadImageToCloudinary(
    file,
    "urban-threads/avatars"
  );

  return Response.json({
    url: result.secure_url,
  });
}
