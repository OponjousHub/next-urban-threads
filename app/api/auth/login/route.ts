import { NextResponse } from "next/server";

import AuthController from "@/modules/auth/auth.controller";
import { LoginSchema } from "@/modules/auth/auth.schema";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function POST(req: Request) {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      console.error("LOGIN ERROR: Default tenant not found");

      return NextResponse.json(
        { error: "Unable to complete login at this time." },
        { status: 500 },
      );
    }

    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const result = await AuthController.login(parsed.data);

    if (result.user.twoFactorEnabled) {
      return NextResponse.json({
        requires2FA: true,
        userId: result.user.id,
        tenantId: tenant.id,
      });
    }

    const response = NextResponse.json(result, {
      status: 200,
    });

    // Set authentication cookie
    response.cookies.set("token", result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    /**
     * Expected authentication errors.
     *
     * These are not server failures. They mean the
     * credentials supplied by the user were not valid.
     */
    if (
      error instanceof Error &&
      (error.message === "Invalid email or password" ||
        error.message === "Wrong username or password")
    ) {
      return NextResponse.json(
        {
          error: "Wrong username or password",
        },
        { status: 401 },
      );
    }

    /**
     * Unexpected server/database errors.
     */
    return NextResponse.json(
      {
        error: "Internal server error",
      },
      { status: 500 },
    );
  }
}
