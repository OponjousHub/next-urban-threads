import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function GET() {
  const tenant = await getDefaultTenant();
  if (!tenant) return NextResponse.json([], { status: 401 });

  const faqs = await prisma.fAQ.findMany({
    where: { tenantId: tenant.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(faqs);
}

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  if (!tenant)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { question, answer, category } = await req.json();

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      category: category || "General",
      tenantId: tenant.id,
    },
  });

  return NextResponse.json(faq);
}
