import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { AddressSchema } from "@/modules/address/address.schema";
import AddressController from "@/modules/address/address.controller";

export async function GET() {
  const userId = await getLoggedInUserId();

  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const addresses = await prisma.address.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(addresses);
}

export async function POST(req: Request) {
  const userId = await getLoggedInUserId();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const parsed = AddressSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const result = AddressController.addAddress(data);

  return NextResponse.json(result, { status: 201 });
}
