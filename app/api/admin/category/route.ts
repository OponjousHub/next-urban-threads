import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function GET() {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const categories = await prisma.category.findMany({
    where: { tenantId: tenant.id },
    orderBy: { name: "asc" },
  });
  return new Response(JSON.stringify(categories));
}

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, image, isFeatured } = body;

  if (!name) {
    return new Response(JSON.stringify({ error: "Name required" }), {
      status: 400,
    });
  }

  const category = await prisma.category.create({
    data: {
      tenantId: tenant.id,
      name,
      slug: name.toLowerCase().replace(/\s+/g, "-"),
      image,
      isFeatured,
    },
  });

  return new Response(JSON.stringify(category));
}
