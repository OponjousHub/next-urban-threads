import { prisma } from "@/utils/prisma";
import { NextResponse } from "next/server";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

type Variant = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  image?: string;
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } },
) {
  const paramsId = await params;
  const tenant = await getDefaultTenant();
  if (!tenant) {
    throw new Error("Default tenant not found");
  }
  try {
    const body = await req.json();
    const {
      name,
      category,
      subCategory,
      price,
      images,
      description,
      sizes,
      colours,
      stock,
      featured,
      flash,
      videos,
      variants,
    } = body;

    const updated = await prisma.product.update({
      where: { id: paramsId.id, tenantId: tenant.id },
      data: {
        name,
        category: {
          connect: { id: category },
        },
        subCategory,
        price,
        images,
        description,
        sizes,
        colours,
        stock,
        featured,
        videos,
        isFlashDeal: flash,
      },
    });

    // Update variant

    if (variants?.length) {
      // Remove old variants
      await prisma.productVariant.deleteMany({
        where: {
          productId: paramsId.id,
        },
      });

      // Create updated variants
      await prisma.productVariant.createMany({
        data: variants.map((variant: Variant) => ({
          productId: paramsId.id,
          color: variant.color,
          colorHex: variant.colorHex,
          size: variant.size,
          stock: variant.stock,
          price: variant.price,
          image: variant.image || "",
        })),
      });

      // Recalculate total stock
      const totalStock = variants.reduce(
        (sum: any, variant: Variant) => sum + Number(variant.stock || 0),
        0,
      );

      await prisma.product.update({
        where: {
          id: paramsId.id,
        },

        data: {
          stock: totalStock,
          instock: totalStock > 0,
        },
      });
    }

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
