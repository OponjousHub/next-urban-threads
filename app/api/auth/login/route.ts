import { NextResponse } from "next/server";
import AuthController from "@/modules/auth/auth.controller";
import { LoginSchema } from "@/modules/auth/auth.schema";
import { AuthService } from "@/modules/auth/auth.service";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { prisma } from "@/utils/prisma";

import { email } from "zod";

export async function POST(req: Request) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  try {
    const body = await req.json();

    const parsed = LoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // console.log("LOGIN USER -------------", user.id);
    const result = await AuthController.login(parsed.data);

    if (result.user.twoFactorEnabled) {
      return NextResponse.json({
        requires2FA: true,
        userId: result.user.id,
        tenantId: tenant.id,
      });
    }

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
