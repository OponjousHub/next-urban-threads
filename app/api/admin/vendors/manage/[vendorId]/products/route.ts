import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ vendorId: string }>;
  },
) {
  const { vendorId } = await params;

  const products = await prisma.product.findMany({
    where: {
      vendorId,
    },

    include: {
      category: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    data: products,
  });
}
