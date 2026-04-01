import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLoggedInUserId } from "@/lib/auth";
import { hash } from "bcryptjs";

/* ---------------- GET: Load Profile ---------------- */
export async function GET() {
  try {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!tenant || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId: tenant.id },
      select: {
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}

/* ---------------- PATCH: Update Profile ---------------- */
export async function PATCH(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!tenant || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const { name, phone } = body;

    const updateData: any = {
      name,
      phone,
    };

    const updatedUser = await prisma.user.update({
      where: { id: userId, tenantId: tenant.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
