import { NextResponse } from "next/server";

import bcrypt from "bcryptjs";

import { prisma } from "@/utils/prisma";

import { requireOwner, requireAdminOrOwner } from "@/lib/server/auth";

import { CreateAdministratorSchema } from "@/modules/admin/admin.schema";

export async function GET() {
  try {
    const { user, tenant } = await requireAdminOrOwner();

    const administrators = await prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        isDeleted: false,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
      orderBy: [
        {
          role: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });

    return NextResponse.json({
      administrators,
      currentUserRole: user.role,
    });
  } catch (error) {
    console.error("GET ADMINISTRATORS ERROR:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        { message: "Only the store owner can manage administrators." },
        { status: 403 },
      );
    }

    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: Request) {
  try {
    const { tenant } = await requireOwner();

    const body = await req.json();

    const parsed = CreateAdministratorSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const { fullName, email, password, phone, country } = parsed.data;

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        email: normalizedEmail,
        tenantId: tenant.id,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "A user with this email already exists.",
        },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const administrator = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone?.trim() || null,
        country,

        // IMPORTANT:
        // The API determines the role.
        role: "ADMIN",

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
        role: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        message: "Administrator created successfully.",
        administrator,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("CREATE ADMINISTRATOR ERROR:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        {
          message: "Only the store owner can create administrators.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        message: "Unable to create administrator.",
      },
      { status: 500 },
    );
  }
}
