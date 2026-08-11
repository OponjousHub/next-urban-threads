import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 404 });
    }
    console.log("BACKEND CATEGORY FETCH");
    const categories = await prisma.category.findMany({
      where: {
        tenantId: tenant.id,
        isFeatured: true,
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        slug: true,
        image: true,
        isFeatured: true,
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("HOME CATEGORIES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to load homepage categories" },
      { status: 500 },
    );
  }
}
