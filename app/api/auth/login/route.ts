import { NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { LoginSchema } from "@/modules/auth/auth.schema";
import { AuthService } from "@/modules/auth/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    const result = await AuthController.login(parsed.data);
    const token = AuthService.generateToken(result.user.id);

    const response = NextResponse.json(result, { status: 200 });

    // ✅ SET COOKIE HERE
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
