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

  const orders = await prisma.order.findMany({
    where: {
      vendorId,
    },

    include: {
      user: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return NextResponse.json({
    data: orders,
  });
}
