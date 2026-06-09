import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  const { ids } = await req.json();

  await prisma.vendor.updateMany({
    where: {
      id: {
        in: ids,
      },
      status: "SUSPENDED",
    },
    data: {
      status: "APPROVED",
    },
  });

  return NextResponse.json({
    success: true,
  });
}
