import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await req.json();
  // items = [{ id, order }]

  const updates = items.map((item: any) =>
    prisma.fAQ.update({
      where: { id: item.id },
      data: { order: item.order },
    }),
  );

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
