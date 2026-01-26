import { NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { RegisterSchema } from "@/modules/users/user.schema";
import UserController from "@/modules/users/user.controller";
import { AuthService } from "@/modules/auth/auth.service";
import { getLoggedInUser } from "@/lib/auth";

export async function POST(req: Request) {
  const id = await getLoggedInUser();
  console.log("loooooged iiiiin ID", id);
  try {
    const body = await req.json();
    // 1️⃣ Validate request body
    const parsed = RegisterSchema.safeParse(body);
    console.log("Validated", parsed);
    // 2️⃣ Insert THIS EXACT BLOCK here (the fix)
    if (!parsed.success) {
      const zodError = parsed.error; // ← required narrowing fix
      const formatted = zodError.flatten();

      return NextResponse.json(
        { errors: formatted.fieldErrors },
        { status: 400 },
      );
    }

    // 3️⃣ Parsed data is now guaranteed safe
    const data = parsed.data;
    // console.log("Valid", data);

    // 4️⃣ Pass validated data to controller
    const result = await UserController.register(data);
    console.log("Registered Userrrrrrr!!!!", result);
    // 5 Generate token
    const token = AuthService.generateToken(result.user.userWithoutPassword.id);
    console.log("The main logged in TOKEN!!!!!", token);
    const res = NextResponse.json(result, { status: 201 });
    res.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
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
