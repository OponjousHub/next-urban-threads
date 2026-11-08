import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLoggedInUserId } from "@/lib/auth";

export async function GET() {
  try {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!tenant || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: tenant.id },
      select: {
        name: true,
        email: true,
        addresses: {
          where: {
            tenantId: tenant.id,
            isDeleted: false,
            isTemporary: false,
          },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          take: 1,
          select: { phone: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      name: user.name,
      email: user.email,
      phone: user.addresses[0]?.phone ?? "",
    });
  } catch (error) {
    console.error("ADMIN PROFILE LOAD ERROR:", error);
    return NextResponse.json(
      { error: "Failed to load profile" },
      { status: 500 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!tenant || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;

    const address = await prisma.address.findFirst({
      where: {
        userId,
        tenantId: tenant.id,
        isDeleted: false,
        isTemporary: false,
      },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
      select: { id: true },
    });

    if (phone !== undefined && !address) {
      return NextResponse.json(
        { error: "Add a delivery address before updating your phone number." },
        { status: 400 },
      );
    }

    await prisma.$transaction(async (tx) => {
      if (name !== undefined) {
        await tx.user.update({
          where: { id: userId, tenantId: tenant.id },
          data: { name },
        });
      }

      if (phone !== undefined && address) {
        await tx.address.update({
          where: { id: address.id },
          data: { phone: phone || null },
        });
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN PROFILE UPDATE ERROR:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
