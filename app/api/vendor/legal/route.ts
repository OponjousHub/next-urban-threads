import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getCurrentVendor } from "@/lib/vendor/getCurrentVendor";

import { NextResponse } from "next/server";

export async function GET() {
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found!" }, { status: 401 });
  }

  return Response.json({
    termsOfService: vendor?.termsOfService || "",
    privacyPolicy: vendor?.privacyPolicy || "",
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const { vendor } = await getCurrentVendor();

  if (!vendor) {
    return NextResponse.json({ error: "Vendor not found!" }, { status: 401 });
  }

  await prisma.vendor.update({
    where: { id: vendor!.id },
    data: {
      termsOfService: body.termsOfService,
      privacyPolicy: body.privacyPolicy,
    },
  });

  return Response.json({ success: true });
}
