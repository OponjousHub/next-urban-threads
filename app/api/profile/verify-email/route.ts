import { prisma } from "@/utils/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) return Response.json({ error: "Invalid token" });

  const user = await prisma.user.findFirst({
    where: {
      emailVerifyToken: token,
      emailTokenExpiry: { gt: new Date() },
      pendingEmail: { not: null },
    },
  });

  if (!user) {
    return Response.json({ error: "Token expired" });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      email: user.pendingEmail!,
      pendingEmail: null,
      emailVerifyToken: null,
      emailTokenExpiry: null,
    },
  });

  return Response.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/profile?emailUpdated=true`,
  );
}
