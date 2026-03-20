import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  try {
    const body = await req.json();

    const updated = await prisma.product.update({
      where: { id: params.id, tenantId: tenant.id },
      data: body,
    });

    return Response.json(updated);
  } catch (err) {
    return Response.json(
      { message: "Failed to update product" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 },
      );
    }

    await prisma.product.update({
      where: { id, tenantId: tenant.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Failed to delete product" },
      { status: 500 },
    );
  }
}
