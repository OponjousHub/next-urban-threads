import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: Request) {
  try {
    const tenant = await getDefaultTenant();
    if (!tenant) throw new Error("Tenant not found");

    const body = await req.json();

    const {
      name,
      email,
      currency,
      logo,
      primaryColor,
      timezone,
      address,
      heroTitle,
      heroSubtitle,
      heroCTA,
      heroImage,
    } = body;

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        name,
        email,
        currency,
        logo,
        primaryColor,
        timezone,
        heroCTA,
        heroImage,
        heroSubtitle,
        heroTitle,
        address: {
          updateMany: {
            where: { id: tenant.id },
            data: { street: address },
          },
        },
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

export async function GET() {
  const tenant = await prisma.tenant.findFirst({
    where: { isDefault: true },
    include: {
      address: true, // <- this loads the address relation
    },
  });

  if (!tenant) {
    return new Response(JSON.stringify({ error: "Tenant not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({
      name: tenant.name,
      email: tenant.email,
      currency: tenant.currency,
      logo: tenant.logo,
      primaryColor: tenant.primaryColor,
      timezone: tenant.timezone,
      heroImage: tenant.heroImage,
      heroCTA: tenant.heroCTA,
      heroSubtitle: tenant.heroSubtitle,
      heroTitle: tenant.heroTitle,
      address: tenant.address?.[0] // pick the first address if only one is used
        ? `${tenant.address[0].street}, ${tenant.address[0].city}, ${tenant.address[0].state}`
        : "",
    }),
  );
}
