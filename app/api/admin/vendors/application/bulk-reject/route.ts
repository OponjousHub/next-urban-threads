import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  const auth = await getAuthPayload();

  //  Prevent non-admon from rejecting application
  if (!auth || auth.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
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
