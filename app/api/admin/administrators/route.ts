import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getAuthPayload } from "@/lib/server/auth";
import UserController from "@/modules/users/user.controller";
import { CreateAdminSchema } from "@/modules/users/admin.schema";

export async function POST(req: Request) {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const { userId, tenant, role } = await getAuthPayload();

    if (!userId || !tenant) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    // ---------------------------------------------------------
    // 2. Authorization
    // ---------------------------------------------------------

    if (role !== "ADMIN") {
      return NextResponse.json(
        { message: "You are not authorized to create administrators." },
        { status: 403 },
      );
    }

    // ---------------------------------------------------------
    // 3. Validate request body
    // ---------------------------------------------------------

    const body = await req.json();

    const parsed = CreateAdminSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          message: "Please correct the highlighted fields.",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    // ---------------------------------------------------------
    // 4. Create administrator
    // ---------------------------------------------------------

    const admin = await UserController.createAdmin(parsed.data);

    return NextResponse.json(
      {
        success: true,
        message: "Administrator created successfully.",
        admin,
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("CREATE ADMINISTRATOR ERROR:", error);

    if (error?.message === "Email already exists") {
      return NextResponse.json(
        { message: "An account with this email already exists." },
        { status: 409 },
      );
    }

    if (error?.message === "Default tenant not found") {
      return NextResponse.json(
        { message: "Default tenant not found." },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "Unable to create administrator." },
      { status: 500 },
    );
  }
}

export async function GET() {
  try {
    // ---------------------------------------------------------
    // 1. Authentication
    // ---------------------------------------------------------

    const { userId, tenant, role } = await getAuthPayload();

    if (!userId || !tenant) {
      return NextResponse.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    // ---------------------------------------------------------
    // 2. Authorization
    // ---------------------------------------------------------

    if (role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "You are not authorized to view administrators.",
        },
        { status: 403 },
      );
    }

    // ---------------------------------------------------------
    // 3. Get administrators for current tenant
    // ---------------------------------------------------------

    const administrators = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: "ADMIN",
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        country: true,
        role: true,
        status: true,
        createdAt: true,
        tenantId: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return NextResponse.json({
      administrators,
    });
  } catch (error) {
    console.error("GET ADMINISTRATORS ERROR:", error);

    return NextResponse.json(
      {
        message: "Unable to load administrators.",
      },
      { status: 500 },
    );
  }
}
