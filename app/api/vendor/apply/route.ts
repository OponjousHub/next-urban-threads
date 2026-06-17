import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";

export async function POST(req: Request) {
  try {
    const { businessName, businessEmail, businessPhone, description } =
      await req.json();
    const { userId, tenant } = await getAuthPayload();

    if (!userId || !tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Block application from user whose application is pending
    const existing = await prisma.vendorApplication.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          message: "You already have a pending application",
        },
        { status: 400 },
      );
    }

    // block users who are already vendors
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (user?.role === "Vendor") {
      return NextResponse.json(
        {
          message: "You are already a vendor",
        },
        { status: 400 },
      );
    }

    // Create review (default PENDING if moderation enabled)
    const vendorApply = await prisma.vendorApplication.create({
      data: {
        userId: userId,
        tenantId: tenant.id,
        businessName: businessName,
        businessEmail: businessEmail,
        businessPhone: businessPhone,
        description: description,
      },
    });

    return NextResponse.json(
      {
        data: vendorApply,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error creating review" },
      { status: 500 },
    );
  }
}
