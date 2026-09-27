import { NextResponse } from "next/server";

import { prisma } from "@/utils/prisma";

import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const {
      name,
      email,
      country,
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
      where: {
        id: tenant.id,
      },

      data: {
        name: name?.trim() || "Your Store",
        email: email?.trim() || null,
        country: country?.trim() || tenant.country,
        currency: currency || null,
        logo: logo?.trim() || null,
        primaryColor: primaryColor?.trim() || null,
        timezone: timezone?.trim() || null,

        businessAddress: address?.trim() || null,

        heroCTA: heroCTA?.trim() || null,
        heroImage: heroImage?.trim() || null,
        heroSubtitle: heroSubtitle?.trim() || null,
        heroTitle: heroTitle?.trim() || null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("UPDATE SETTINGS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        { message: "Tenant not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      name: tenant.name,
      email: tenant.email,
      country: tenant.country,
      currency: tenant.currency,
      logo: tenant.logo,
      storeMode: tenant.storeMode,
      primaryColor: tenant.primaryColor,
      timezone: tenant.timezone,

      heroImage: tenant.heroImage,
      heroCTA: tenant.heroCTA,
      heroSubtitle: tenant.heroSubtitle,
      heroTitle: tenant.heroTitle,

      address: tenant.businessAddress || "",
    });
  } catch (error) {
    console.error("GET SETTINGS ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load settings" },
      { status: 500 },
    );
  }
}
