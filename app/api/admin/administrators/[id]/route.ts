import { NextResponse } from "next/server";

import { prisma } from "@/utils/prisma";

import { requireOwner } from "@/lib/auth";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { tenant, user: owner } = await requireOwner();

    const { id } = await params;

    if (id === owner.id) {
      return NextResponse.json(
        {
          message: "The store owner cannot be deleted.",
        },
        { status: 400 },
      );
    }

    const administrator = await prisma.user.findFirst({
      where: {
        id,
        tenantId: tenant.id,
        isDeleted: false,
      },
      select: {
        id: true,
        role: true,
      },
    });

    if (!administrator) {
      return NextResponse.json(
        {
          message: "Administrator not found.",
        },
        { status: 404 },
      );
    }

    if (administrator.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Only administrator accounts can be removed here.",
        },
        { status: 400 },
      );
    }

    await prisma.user.update({
      where: {
        id: administrator.id,
      },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: "Administrator removed successfully.",
    });
  } catch (error) {
    console.error("DELETE ADMINISTRATOR ERROR:", error);

    if (error instanceof Error && error.message === "Forbidden") {
      return NextResponse.json(
        {
          message: "Only the store owner can remove administrators.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json(
      {
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }
}
