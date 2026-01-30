import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { NextResponse } from "next/server";
import AddressController from "@/modules/address/address.controller";
import { AddressInput, AddressSchema } from "@/modules/address/address.schema";
import AddressService from "@/modules/address/address.service";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();
  const parsed = AddressSchema.safeParse(data);

  // if (data.isDefault) {
  //   await prisma.address.updateMany({
  //     where: { userId },
  //     data: { isDefault: false },
  //   });
  // }

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const result = await AddressController.updateAddress(
    userId,
    params.id,
    parsed.data,
  );

  return NextResponse.json(result);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } },
) {
  await prisma.address.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
