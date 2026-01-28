// import { cookies } from "next/headers";
// import AuthController from "@/modules/auth/auth.controller";

// export async function getLoggedInUser() {
//   // 1️⃣ Auth
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;

//   if (!token) return null;

//   const userId = AuthController.getUserIdFromToken(token);
//   if (!userId) return null;

//   return userId;
// }
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function getLoggedInUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  // const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };
    return payload.userId;
  } catch {
    return null;
  }
}
