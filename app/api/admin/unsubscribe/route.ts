import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();
    const { email } = await req.json();
    console.log("UNSUBCRIBING THE SUBSCRIPTION");
    if (!tenant) throw new Error("Tenant not found");

    await prisma.newsletter.deleteMany({
      where: {
        email,
        tenantId: tenant.id,
      },
    });

    return NextResponse.json({ message: "Unsubscribed successfully" });
  } catch (err) {
    return NextResponse.json(
      { message: "Failed to unsubscribe" },
      { status: 500 },
    );
  }
}
