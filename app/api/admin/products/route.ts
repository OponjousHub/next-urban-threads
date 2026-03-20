import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLoggedInUserId } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const userId = await getLoggedInUserId();
  const tenant = await getDefaultTenant();

  if (!userId) {
    return NextResponse.json(
      { message: "Unauthorized: invalid token" },
      { status: 401 },
    );
  }
  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        deletedAt: null,
      },
      orderBy: { createdAt: "desc" },
    });

    return Response.json({ products });
  } catch (error) {
    return Response.json(
      { message: "Failed to fetch products" },
      { status: 500 },
    );
  }
}
