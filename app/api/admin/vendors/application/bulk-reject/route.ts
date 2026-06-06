import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

export async function POST(req: Request) {
  const { ids } = await req.json();

  await prisma.vendorApplication.updateMany({
    where: {
      id: {
        in: ids,
      },
      status: "PENDING",
    },
    data: {
      status: "REJECTED",
    },
  });

  return NextResponse.json({
    success: true,
  });
}
