// lib/session.ts
import { prisma } from "@/utils/prisma";

export async function touchSession(sessionId: string) {
  await prisma.session.update({
    where: { id: sessionId },
    data: { lastActiveAt: new Date() },
  });
}
