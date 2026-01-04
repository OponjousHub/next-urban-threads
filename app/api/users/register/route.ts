import { NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { RegisterSchema } from "@/modules/users/user.schema";
import UserController from "@/modules/users/user.controller";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 1️⃣ Validate request body
    const parsed = RegisterSchema.safeParse(body);

    // 2️⃣ Insert THIS EXACT BLOCK here (the fix)
    if (!parsed.success) {
      const zodError = parsed.error; // ← required narrowing fix
      const formatted = zodError.flatten();

      return NextResponse.json(
        { errors: formatted.fieldErrors },
        { status: 400 }
      );
    }

    // 3️⃣ Parsed data is now guaranteed safe
    const data = parsed.data;

    // 4️⃣ Pass validated data to controller
    const result = await UserController.register(data);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("REGISTER ERROR:", error);

    if (error.message === "Email already exists") {
      return NextResponse.json({ message: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
