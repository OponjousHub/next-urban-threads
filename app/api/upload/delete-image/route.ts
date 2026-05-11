// import { v2 as cloudinary } from "cloudinary";

// export async function POST(req: Request) {
//   const { public_id } = await req.json();

//   try {
//     await cloudinary.uploader.destroy(public_id);

//     return Response.json({ success: true });
//   } catch (err) {
//     return Response.json({ error: "Delete failed" }, { status: 500 });
//   }
// }
