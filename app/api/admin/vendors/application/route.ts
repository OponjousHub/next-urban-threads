import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import { NextResponse } from "next/server";

export async function GET() {
  const application = await prisma.vendorApplication.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    {
      data: application,
    },
    { status: 200 },
  );
}
