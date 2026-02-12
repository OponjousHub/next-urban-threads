import { NextRequest, NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import bcrypt from "bcrypt";
import { prisma } from "@/utils/prisma";
import { getLoggedInUserId } from "@/lib/auth";

export async function PATCH(req: NextRequest) {
  try {
    const tenant = await getDefaultTenant();
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: "All fields required" },
        { status: 400 },
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // 🔐 Get user with password
    const dbUser = await prisma.user.findUnique({
      where: { id: userId, tenantId: tenant.id },
    });

    if (!dbUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // 🔐 Verify current password
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      dbUser.password,
    );

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 400 },
      );
    }

    // ❌ Prevent reuse of same password
    const isSamePassword = await bcrypt.compare(newPassword, dbUser.password);

    if (isSamePassword) {
      return NextResponse.json(
        { message: "New password must be different" },
        { status: 400 },
      );
    }

    // password strength vallidation
    if (newPassword.length < 8) {
      return NextResponse.json(
        { message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId, tenantId: tenant.id },
      data: {
        password: hashedPassword,
        passwordUpdatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to update password" },
      { status: 500 },
    );
  }
}
