import { prisma } from "@/utils/prisma";
import { getLoggedInUser } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getLoggedInUser();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id: params.id },
    data,
  });

  return NextResponse.json(address);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
