import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function POST(req: Request) {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found!" }, { status: 401 });
  }

  const { shippingPolicy, returnPolicy } = await req.json();

  await prisma.tenant.update({
    where: { id: vendor.id },
    data: {
      shippingPolicy,
      returnPolicy,
    },
  });

  return NextResponse.json({ success: true });
}

export async function GET() {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found!" }, { status: 401 });
  }

  const data = await prisma.tenant.findUnique({
    where: { id: vendor.id },
    select: {
      shippingPolicy: true,
      returnPolicy: true,
    },
  });

  return NextResponse.json(data);
}
