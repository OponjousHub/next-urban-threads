import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/app/lib/auth";

type RouteParams = {
  params: Promise<{
    payoutId: string;
  }>;
};

export async function PATCH(req: Request, { params }: RouteParams) {
  const { payoutId } = await params;

  const { tenant } = await getAuthPayload();

  if (!tenant) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payout = await prisma.vendorPayout.update({
      where: {
        id: payoutId,
        tenantId: tenant.id,
      },

      data: {
        status: "APPROVED",
        approvedAt: new Date(),
      },
    });

    return NextResponse.json(payout);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Unable to approve payout." },
      { status: 500 },
    );
  }
}
