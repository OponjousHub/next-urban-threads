import { cookies } from "next/headers";
import AuthController from "@/modules/auth/auth.controller";

export async function getLoggedInUser() {
  // 1️⃣ Auth
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  const userId = AuthController.getUserIdFromToken(token);
  if (!userId) return null;

  return userId;
}
