import AuthController from "@/modules/auth/auth.controller";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { includes } from "zod";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: missing token!" },
      { status: 401 }
    );
  }

  const userId = AuthController.getUserIdFromToken(token);
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const order = await prisma.order.findMany({
    where: { userId: userId },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(order);
}
