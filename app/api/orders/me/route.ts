import AuthController from "@/modules/auth/auth.controller";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const userId = await getLoggedInUserId();
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  if (!token) {
    return NextResponse.json(
      { message: "Unauthorized: missing token!" },
      { status: 401 },
    );
  }

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized!" }, { status: 401 });
  }

  const order = await prisma.order.findMany({
    where: { userId: userId, tenantId: tenant.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(order);
}
