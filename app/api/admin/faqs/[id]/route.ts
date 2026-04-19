import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();

  await prisma.fAQ.delete({
    where: { id: params.id, tenantId: tenant!.id },
  });

  return Response.json({ success: true });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();

  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { question, answer, category } = await req.json();

  try {
    const updated = await prisma.fAQ.update({
      where: {
        id: params.id,
        tenantId: tenant.id, // 🔒 protect tenant data
      },
      data: {
        ...(question && { question }),
        ...(answer && { answer }),
        ...(category && { category }),
      },
    });

    return NextResponse.json({ success: true, faq: updated });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 },
    );
  }
}
