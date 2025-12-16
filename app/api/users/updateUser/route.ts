import AuthController from "@/modules/auth/auth.controller";
import { UpdateUserSchema } from "@/modules/users/user.schema";
import UserController from "@/modules/users/user.controller";
import { NextResponse } from "next/server";
// import verifyToken  from "@/modules/auth/auth.controller";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    // Extract token from cookies
    const cookieHeader = req.headers.get("cookie");
    const token = cookieHeader
      ?.split("; ")
      .find((c) => c.startsWith("token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = AuthController.verifyToken(token);
    console.log(payload);
    const userId = payload.id;

    const parsed = UpdateUserSchema.safeParse(body);

    if (!parsed.success) {
      const zodError = parsed.error; // ← required narrowing fix
      const formatted = zodError.flatten();

      return NextResponse.json(
        { error: formatted.fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const result = await UserController.updateUser(userId, data);

    if (!result.success || !result.user) {
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "User updated successfully", user: result.user },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE USER ERROR:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
