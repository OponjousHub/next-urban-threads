import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: Request) {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) throw new Error("Tenant not found");

    const body = await req.json();

    const { name, email, currency, logo, primaryColor, timezone, address } =
      body;

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name,
        email,
        currency,
        logo,
        primaryColor,
        timezone,
        address,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 },
    );
  }
}
