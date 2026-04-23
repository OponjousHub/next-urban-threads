import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    return NextResponse.json({
      aboutTitle: tenant?.aboutTitle || "",
      aboutDescription: tenant?.aboutDescription || "",
      aboutStory: tenant?.aboutStory || "",
      aboutImage: tenant?.aboutImage || "",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load About page" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }

    const updated = await prisma.tenant.update({
      where: { id: tenant.id },
      data: {
        aboutTitle: body.aboutTitle,
        aboutDescription: body.aboutDescription,
        aboutStory: body.aboutStory,
        aboutImage: body.aboutImage,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update About page" },
      { status: 500 },
    );
  }
}
