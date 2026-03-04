import "server-only";

import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";
import { touchSession } from "@/lib/sessions";
import { redirect } from "next/navigation";

export async function getLoggedInUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
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

    if (decoded.sessionId) {
      await touchSession(decoded.sessionId); // ✅ Touch once per request
    }
    return decoded.sessionId || null;
  } catch {
    return null;
  }
}

export async function getUserRole() {
  const userId = await getLoggedInUserId();

  const tenant = await getDefaultTenant();

  if (!userId || !tenant) {
    throw new Error("Unauthorized!");
  }

  const user = await prisma.user.findFirst({
    where: { id: userId, tenantId: tenant?.id },
    select: { id: true, role: true },
  });
  if (!user) redirect("/login");
  const role = user.role;

  return role;
}

export async function getAuthPayload() {
  const userId = await getLoggedInUserId();

  const tenant = await getDefaultTenant();
  const currentSessionId = await getCurrentSessionId();
  const role = await getUserRole();
  return { userId, tenant, currentSessionId, role };
}

export async function getOptionalAuthPayload() {
  try {
    return await getAuthPayload();
  } catch {
    return {
      userId: null,
      role: null,
      tenant: null,
    };
  }
}
