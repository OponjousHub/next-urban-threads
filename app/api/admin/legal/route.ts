import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) return NextResponse.json([], { status: 401 });

  return Response.json({
    termsOfService: tenant?.termsOfService || "",
    privacyPolicy: tenant?.privacyPolicy || "",
  });
}

export async function PATCH(req: Request) {
  const body = await req.json();
  const tenant = await getDefaultTenant();

  await prisma.tenant.update({
    where: { id: tenant!.id },
    data: {
      termsOfService: body.termsOfService,
      privacyPolicy: body.privacyPolicy,
    },
  });

  return Response.json({ success: true });
}
