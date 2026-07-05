import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

export async function PATCH(req: Request) {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    return NextResponse.json(
      {
        message: "Vendor not found.",
      },
      {
        status: 401,
      },
    );
  }

  const body = await req.json();

  await prisma.vendor.update({
    where: {
      id: vendor.id,
    },

    data: body,
  });

  return NextResponse.json({
    success: true,
  });
}
