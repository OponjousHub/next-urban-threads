import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import InventoryService from "@/lib/inventory/inventory.service";

type Variant = {
  id?: string;
  color: string;
  colorHex: string;
  size: string;
  stock: number;
  price: number;
  image?: string;
};

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   PATCH — UPDATE PRODUCT
   ========================================================= */

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Product ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Default tenant not found",
        },
        {
          status: 404,
        },
      );
    }

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
      featured,
      flash,
      videos,
      variants,
    } = body;

    /* ---------------------------------------------------------
       Validate product exists and belongs to tenant
       --------------------------------------------------------- */

    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        tenantId: tenant.id,
        deletedAt: null,
      },
      select: {
        id: true,
        stock: true,
        categoryId: true,
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    /* =========================================================
       TRANSACTION
       ========================================================= */

    const updated = await prisma.$transaction(async (tx) => {
      /* -------------------------------------------------------
         Build product update data
         ------------------------------------------------------- */

      const productUpdateData: any = {};

      if (name !== undefined) {
        productUpdateData.name = name;
      }

      if (subCategory !== undefined) {
        productUpdateData.subCategory = subCategory;
      }

      if (price !== undefined) {
        productUpdateData.price = Number(price);
      }

      if (images !== undefined) {
        productUpdateData.images = images;
      }

      if (description !== undefined) {
        productUpdateData.description = description;
      }

      if (sizes !== undefined) {
        productUpdateData.sizes = sizes;
      }

      if (colours !== undefined) {
        productUpdateData.colours = colours;
      }

      if (featured !== undefined) {
        productUpdateData.featured = featured;
      }

      if (flash !== undefined) {
        productUpdateData.isFlashDeal = flash;
      }

      if (videos !== undefined) {
        productUpdateData.videos = videos;
      }

      /* -------------------------------------------------------
         Category
         ------------------------------------------------------- */

      if (category !== undefined && category !== "") {
        productUpdateData.category = {
          connect: {
            id: category,
          },
        };
      }

      /* -------------------------------------------------------
         Update product information
         ------------------------------------------------------- */

      await tx.product.update({
        where: {
          id,
        },
        data: productUpdateData,
      });

      /* =======================================================
         VARIANTS
         =======================================================

         Important:

         variants === undefined
           → do NOT touch existing variants

         variants === []
           → remove all variants

         variants === [...]
           → replace existing variants
      ======================================================= */

      if (Array.isArray(variants)) {
        /* -----------------------------------------------------
           Delete existing variants
           ----------------------------------------------------- */

        await tx.productVariant.deleteMany({
          where: {
            productId: id,
          },
        });

        /* -----------------------------------------------------
           Create new variants
           ----------------------------------------------------- */

        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((variant: Variant) => ({
              productId: id,
              color: variant.color,
              colorHex: variant.colorHex,
              size: variant.size,
              stock: Number(variant.stock || 0),
              price: Number(variant.price || 0),
              image: variant.image || "",
            })),
          });
        }

        /* -----------------------------------------------------
           Recalculate total product inventory
           ----------------------------------------------------- */

        const totalStock = variants.reduce(
          (sum: number, variant: Variant) => sum + Number(variant.stock || 0),
          0,
        );

        await InventoryService.adjustStock({
          tx,
          productId: id,
          stock: totalStock,
        });
      }

      /* -------------------------------------------------------
         Return fresh product including variants
         ------------------------------------------------------- */

      return tx.product.findUnique({
        where: {
          id,
        },
        include: {
          variants: true,
          category: true,
        },
      });
    });

    return NextResponse.json(updated, {
      status: 200,
    });
  } catch (error) {
    console.error("UPDATE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to update product",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================================================
   DELETE — SOFT DELETE PRODUCT
   ========================================================= */

export async function DELETE(req: Request, { params }: RouteContext) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          message: "Product ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json(
        {
          message: "Default tenant not found",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------
       Make sure product belongs to tenant
       --------------------------------------------------------- */

    const product = await prisma.product.findFirst({
      where: {
        id,
        tenantId: tenant.id,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        {
          status: 404,
        },
      );
    }

    /* ---------------------------------------------------------
       Soft delete
       --------------------------------------------------------- */

    await prisma.product.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        message: "Product deleted successfully",
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("DELETE PRODUCT ERROR:", error);

    return NextResponse.json(
      {
        message: "Failed to delete product",
      },
      {
        status: 500,
      },
    );
  }
}
