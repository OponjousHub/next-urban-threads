import AuthController from "@/modules/auth/auth.controller";
import { prisma } from "@/utils/prisma";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function getUserIdFromToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) throw new Error("Unauthorized:");
  const payload = AuthController.verifyToken(token);

  return payload.id;
}

// Get User profile
export async function GET() {
  try {
    const userId = await getUserIdFromToken();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        country: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("USER PROFILE ERROR:", error);

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function DELETE() {
  try {
    const userId = await getUserIdFromToken();

    const user = await prisma.user.delete({ where: { id: userId } });

    NextResponse.json({ message: "Account deleted successfully!" });
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
  }
}
