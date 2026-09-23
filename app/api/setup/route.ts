import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { z } from "zod";

import { prisma } from "@/utils/prisma";

import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

import { AuthService } from "@/modules/auth/auth.service";

/*
|--------------------------------------------------------------------------
| Initial administrator setup schema
|--------------------------------------------------------------------------
|
| This is intentionally different from normal customer registration.
|
| A store owner does not need to provide a shipping address just to
| create the first administrator account.
|
*/

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

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
|
| Used by the setup page to determine whether initial setup is still
| available.
|
*/

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

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
|
| Creates the FIRST administrator for the default tenant.
|
| Important security rules:
|
| 1. A setup secret is required.
| 2. A default tenant must exist.
| 3. An administrator must NOT already exist.
| 4. The operation is protected against two simultaneous setup requests.
|
*/

export async function POST(req: Request) {
  try {
    /*
    |--------------------------------------------------------------------------
    | Validate request
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Verify setup secret
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Get default tenant
    |--------------------------------------------------------------------------
    */

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Default tenant not found.",
        },
        { status: 404 },
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Normalize email
    |--------------------------------------------------------------------------
    */

    const normalizedEmail = email.trim().toLowerCase();

    /*
    |--------------------------------------------------------------------------
    | Check whether an administrator already exists
    |--------------------------------------------------------------------------
    */

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

    /*
    |--------------------------------------------------------------------------
    | Check email
    |--------------------------------------------------------------------------
    |
    | Email is globally unique in your User model.
    |
    */

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

    /*
    |--------------------------------------------------------------------------
    | Hash password
    |--------------------------------------------------------------------------
    */

    const hashedPassword = await bcrypt.hash(password, 10);

    /*
    |--------------------------------------------------------------------------
    | Create the first administrator
    |--------------------------------------------------------------------------
    |
    | We use a transaction and re-check for an ADMIN inside the transaction.
    |
    | This helps prevent two setup requests from both attempting to create
    | the first administrator at approximately the same time.
    |
    */

    const admin = await prisma.$transaction(async (tx) => {
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
          role: true,
          tenantId: true,
        },
      });
    });

    /*
    |--------------------------------------------------------------------------
    | Generate authentication token
    |--------------------------------------------------------------------------
    */

    const token = AuthService.generateToken(admin.id);

    const res = NextResponse.json(
      {
        success: true,
        message: "Store administrator created successfully.",
        user: admin,
      },
      { status: 201 },
    );

    /*
    |--------------------------------------------------------------------------
    | Set authentication cookie
    |--------------------------------------------------------------------------
    */

    res.cookies.set("token", token, {
      httpOnly: true,

      secure: process.env.NODE_ENV === "production",

      sameSite: "lax",

      path: "/",

      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    /*
    |--------------------------------------------------------------------------
    | Another setup request may have created the admin first.
    |--------------------------------------------------------------------------
    */

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
