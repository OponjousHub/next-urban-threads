import UserController from "@/modules/users/user.controller";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

// Get User profile
export async function GET() {
  try {
    const userId = await getLoggedInUserId();
    const tenant = await getDefaultTenant();

    if (!userId || !tenant) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findFirst({
      where: { id: userId, tenantId: tenant.id },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        city: true,
        country: true,
        createdAt: true,
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
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { addresses, ...profile } = user;

    return NextResponse.json({
      ...profile,
      phone: addresses[0]?.phone ?? "",
    });
  } catch (error) {
    console.error("USER PROFILE ERROR:", error);

    return NextResponse.json(
      { message: "Failed to load profile" },
      { status: 500 },
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await UserController.deleteUserAccount(token);

    cookieStore.set("token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
