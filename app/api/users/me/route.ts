import UserController from "@/modules/users/user.controller";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getLoggedInUserId } from "@/lib/auth";

// Get User profile
export async function GET() {
  try {
    const userId = await getLoggedInUserId();

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        city: true,
        country: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("USER PROFILE ERROR:", error);

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
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

    // Clear the authentication cookie after deletion
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
