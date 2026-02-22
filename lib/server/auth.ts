import "server-only";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

import { touchSession } from "@/lib/sessions";

export async function getLoggedInUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  // const token = cookies().get("token")?.value;
  if (!token) return null;

  try {
    const payload: any = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    if (payload.sessionId) {
      await touchSession(payload.sessionId); // ✅ Touch once per request
    }

    return payload.userId;
  } catch {
    return null;
  }
}

// getCurrentSessionId.ts
export async function getCurrentSessionId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) return null;

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log("TOKEN SESSION ID:", decoded.sessionId);

    if (decoded.sessionId) {
      await touchSession(decoded.sessionId); // ✅ Touch once per request
    }

    return decoded.sessionId || null;
  } catch {
    return null;
  }
}
