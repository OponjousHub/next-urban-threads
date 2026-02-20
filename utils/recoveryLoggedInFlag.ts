import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// export async function getRecoveryLoginFlag() {
//   const cookieStore = await cookies();
//   const token = cookieStore.get("token")?.value;

//   if (!token) return false;

//   try {
//     const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
//     console.log("DECODED USED RECOVERY CODE", decoded.usedRecoveryLogin);
//     console.log("JWT PAYLOAD:", decoded);
//     return cookieStore.get("recovery_notice")?.value === "true";
//     // return decoded.usedRecoveryLogin === true;
//   } catch {
//     return false;
//   }
// }

export async function getRecoveryLoginFlag(): Promise<{
  remaining: number;
} | null> {
  const cookieStore = await cookies();
  const notice = cookieStore.get("recovery_notice")?.value;

  if (!notice) return null;

  try {
    return JSON.parse(notice);
  } catch {
    return null;
  }
}
