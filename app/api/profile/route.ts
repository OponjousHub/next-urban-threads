import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(req: NextRequest) {
  try {
    const userId = await getLoggedInUserId();
    const tenant = await getDefaultTenant();

    if (!userId || !tenant) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    const name = typeof body.name === "string" ? body.name.trim() : undefined;
    const phone =
      typeof body.phone === "string" ? body.phone.trim() : undefined;

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
        { message: "Add a delivery address before updating your phone number." },
        { status: 400 },
      );
    }

    const user = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: userId, tenantId: tenant.id },
        data: name !== undefined ? { name } : {},
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      if (phone !== undefined && address) {
        await tx.address.update({
          where: { id: address.id },
          data: { phone: phone || null },
        });
      }

      return updatedUser;
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to update profile" },
      { status: 500 },
    );
  }
}
