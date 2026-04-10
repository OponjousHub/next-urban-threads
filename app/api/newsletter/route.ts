import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Tenant not found" }, { status: 500 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await prisma.newsletter.create({
      data: {
        email,
        tenantId: tenant.id, // ✅ FIX HERE
      },
    });

    return NextResponse.json({
      success: true,
      message: "Subscribed successfully!",
    });
  } catch (err: any) {
    // Duplicate email
    if (err?.code === "P2002" && err?.meta?.target?.includes("email")) {
      return NextResponse.json(
        { error: "You have already subscribed with this email." },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { error: "Failed to subscribe. Try again later." },
      { status: 500 },
    );
  }
}
