import { NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { LoginSchema } from "@/modules/auth/auth.schema";
import { formatError } from "zod";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      const zodError = parsed.error;
      const formatted = zodError.flatten();
      return NextResponse.json(
        { error: formatted.fieldErrors },
        { status: 400 }
      );
    }
    const data = parsed.data;
    const result = AuthController.login(data);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
