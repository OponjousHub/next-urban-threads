import { NextResponse } from "next/server";
import { RegisterSchema } from "@/modules/users/user.schema";
import UserController from "@/modules/users/user.controller";
import { AuthService } from "@/modules/auth/auth.service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Validate request body
    const parsed = RegisterSchema.safeParse(body);

    if (!parsed.success) {
      const zodError = parsed.error;
      const formatted = zodError.flatten();

      return NextResponse.json(
        { errors: formatted.fieldErrors },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // Pass validated data to controller
    const result = await UserController.register(data);

    // 5 Generate token
    const token = AuthService.generateToken(result.id);

    const res = NextResponse.json(result, { status: 201 });

    // ✅ SET COOKIE
    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return res;
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    if (error.message === "Email already exists") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
