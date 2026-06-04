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

    // Create review (default PENDING if moderation enabled)
    const vendorApply = await prisma.vendorApplication.create({
      data: {
        userId: userId,
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
