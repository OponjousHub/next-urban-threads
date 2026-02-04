import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const { imageUrl } = await req.json();

  await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl: imageUrl },
  });

  return NextResponse.json({ success: true });
}
