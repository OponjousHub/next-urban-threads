import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const param = await params;

  const tenant = await getDefaultTenant();

  if (!tenant) {
    throw new Error("Default tenant not found");
  }

  const refund = await prisma.refundRequest.findFirst({
    where: {
      id: param.id,
      tenantId: tenant.id,
    },
    include: {
      order: {
        select: {
          id: true,
          totalAmount: true,
          shippingCost: true,
          currency: true,
        },
      },
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!refund) {
    return NextResponse.json({ message: "Refund not found." }, { status: 404 });
  }

  return NextResponse.json(refund);
}
