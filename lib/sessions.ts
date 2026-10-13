import { prisma } from "@/utils/prisma";

export async function touchSession(sessionId: string) {
  if (!sessionId) return;

  await prisma.session.updateMany({
    where: { id: sessionId },
    data: { lastActiveAt: new Date() },
  });
}
