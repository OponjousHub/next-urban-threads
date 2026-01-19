import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  response.cookies.delete("token");
  revalidatePath("/", "layout");
  return response;
}
