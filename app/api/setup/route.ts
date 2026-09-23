import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import jwt from "jsonwebtoken";

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { authRepository } from "@/modules/auth/auth.repository";

const SetupSchema = z.object({
  setupSecret: z.string().min(1),

  fullName: z.string().min(2, "Full name must be at least 2 characters."),

  email: z.email("Please enter a valid email address."),

  password: z.string().min(6, "Password must be at least 6 characters."),

  phone: z
    .string()
    .min(7, "Please enter a valid phone number.")
    .optional()
    .or(z.literal("")),

  country: z
    .string()
    .min(2, "Country must be at least 2 characters.")
    .optional()
    .or(z.literal("")),
});

export async function GET() {
  try {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          setupAvailable: false,
          message: "Default tenant not found.",
        },
        { status: 404 },
      );
    }

    const adminExists = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: "ADMIN",
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    return NextResponse.json({
      setupAvailable: !adminExists,
    });
  } catch (error) {
    console.error("SETUP STATUS ERROR:", error);

    return NextResponse.json(
      {
        setupAvailable: false,
        message: "Unable to determine setup status.",
      },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  try {
    // ---------------------------------------------------------
    // 1. Validate request body
    // ---------------------------------------------------------

    const body = await req.json();

    const parsed = SetupSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { setupSecret, fullName, email, password, phone, country } =
      parsed.data;

    // ---------------------------------------------------------
    // 2. Validate setup secret
    // ---------------------------------------------------------

    const expectedSecret = process.env.STORE_SETUP_SECRET;

    if (!expectedSecret) {
      console.error("STORE_SETUP_SECRET is not configured.");

      return NextResponse.json(
        {
          message: "Store setup is not configured on this server.",
        },
        { status: 500 },
      );
    }

    if (setupSecret !== expectedSecret) {
      return NextResponse.json(
        {
          message: "Invalid setup secret.",
        },
        { status: 403 },
      );
    }

    // ---------------------------------------------------------
    // 3. Get default tenant
    // ---------------------------------------------------------

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Default tenant not found.",
        },
        { status: 404 },
      );
    }

    // ---------------------------------------------------------
    // 4. Make sure initial setup has not already been completed
    // ---------------------------------------------------------

    const existingAdmin = await prisma.user.findFirst({
      where: {
        tenantId: tenant.id,
        role: "ADMIN",
        isDeleted: false,
      },
      select: {
        id: true,
      },
    });

    if (existingAdmin) {
      return NextResponse.json(
        {
          message: "Initial store setup has already been completed.",
        },
        { status: 409 },
      );
    }

    // ---------------------------------------------------------
    // 5. Normalize email
    // ---------------------------------------------------------

    const normalizedEmail = email.trim().toLowerCase();

    // ---------------------------------------------------------
    // 6. Make sure email is not already in use
    // ---------------------------------------------------------

    const existingUser = await prisma.user.findUnique({
      where: {
        email: normalizedEmail,
      },
      select: {
        id: true,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "An account with this email already exists.",
        },
        { status: 409 },
      );
    }

    // ---------------------------------------------------------
    // 7. Hash password
    // ---------------------------------------------------------

    const hashedPassword = await bcrypt.hash(password, 10);

    // ---------------------------------------------------------
    // 8. Create first administrator
    // ---------------------------------------------------------

    const admin = await prisma.$transaction(async (tx) => {
      // Re-check inside the transaction to reduce race conditions
      const adminAlreadyCreated = await tx.user.findFirst({
        where: {
          tenantId: tenant.id,
          role: "ADMIN",
          isDeleted: false,
        },
        select: {
          id: true,
        },
      });

      if (adminAlreadyCreated) {
        throw new Error("INITIAL_ADMIN_ALREADY_EXISTS");
      }

      return tx.user.create({
        data: {
          name: fullName.trim(),
          email: normalizedEmail,
          password: hashedPassword,
          phone: phone?.trim() || null,
          country: country?.trim() || null,
          role: "ADMIN",
          status: "ACTIVE",

          tenant: {
            connect: {
              id: tenant.id,
            },
          },
        },

        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          country: true,
          role: true,
          status: true,
          tenantId: true,
        },
      });
    });

    // ---------------------------------------------------------
    // 9. Create a normal authenticated session
    // ---------------------------------------------------------

    const userAgent = req.headers.get("user-agent") || "";

    const rawIp =
      req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";

    const ip = rawIp.split(",")[0].trim() || "127.0.0.1";

    const normalizedIp = ip === "::1" ? "127.0.0.1" : ip;

    const deviceLabel = "Initial Store Setup";

    const session = await authRepository.createSession(
      admin.id,
      tenant.id,
      userAgent,
      normalizedIp,
      deviceLabel,
    );

    // ---------------------------------------------------------
    // 10. Create JWT using the same structure as normal login
    // ---------------------------------------------------------

    const token = jwt.sign(
      {
        userId: admin.id,
        email: admin.email,
        tenantId: tenant.id,
        sessionId: session.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "7d",
      },
    );

    // ---------------------------------------------------------
    // 11. Set authentication cookie
    // ---------------------------------------------------------

    const response = NextResponse.json(
      {
        success: true,
        message: "Store administrator created successfully.",
        user: admin,
      },
      { status: 201 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error: any) {
    if (error?.message === "INITIAL_ADMIN_ALREADY_EXISTS") {
      return NextResponse.json(
        {
          message: "Initial store setup has already been completed.",
        },
        { status: 409 },
      );
    }

    console.error("INITIAL SETUP ERROR:", error);

    return NextResponse.json(
      {
        message: "Unable to complete store setup.",
      },
      { status: 500 },
    );
  }
}
