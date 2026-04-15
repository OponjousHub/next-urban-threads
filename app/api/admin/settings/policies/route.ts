import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { shippingPolicy, returnPolicy } = await req.json();

  await prisma.tenant.update({
    where: { id: tenant.id },
    data: {
      shippingPolicy,
      returnPolicy,
    },
  });

  return NextResponse.json({ success: true });
}

// /api/admin/settings/policies/route.ts

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await prisma.tenant.findUnique({
    where: { id: tenant.id },
    select: {
      shippingPolicy: true,
      returnPolicy: true,
    },
  });

  return NextResponse.json(data);
}
