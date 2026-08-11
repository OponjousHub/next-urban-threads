import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prisma";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

/* ========================================================= */
/* GET CATEGORY PRODUCTS                                     */
/* ========================================================= */

export async function GET(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const products = await prisma.product.findMany({
      where: {
        categoryId: category.id,
        tenantId: tenant.id,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        images: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const safeProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      image:
        product.images && product.images.length > 0 ? product.images[0] : null,
    }));

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
      },
      products: safeProducts,
    });
  } catch (error) {
    console.error("GET CATEGORY PRODUCTS ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load category products",
      },
      { status: 500 },
    );
  }
}

/* ========================================================= */
/* PATCH CATEGORY                                            */
/* ========================================================= */

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const action = body.action;

    /* ===================================================== */
    /* MOVE PRODUCTS                                         */
    /* ===================================================== */

    if (action === "moveProducts") {
      const targetCategoryId = body.targetCategoryId;

      if (!targetCategoryId) {
        return NextResponse.json(
          {
            error: "Destination category is required",
          },
          { status: 400 },
        );
      }

      if (targetCategoryId === category.id) {
        return NextResponse.json(
          {
            error: "Products are already assigned to this category",
          },
          { status: 400 },
        );
      }

      // Make sure the destination belongs to this tenant.
      const targetCategory = await prisma.category.findFirst({
        where: {
          id: targetCategoryId,
          tenantId: tenant.id,
        },
      });

      if (!targetCategory) {
        return NextResponse.json(
          {
            error: "Destination category not found",
          },
          { status: 404 },
        );
      }

      const productCount = await prisma.product.count({
        where: {
          categoryId: category.id,
          tenantId: tenant.id,
          deletedAt: null,
        },
      });

      if (productCount === 0) {
        return NextResponse.json({
          success: true,
          movedCount: 0,
          message: "There are no products to move.",
        });
      }

      const result = await prisma.product.updateMany({
        where: {
          categoryId: category.id,
          tenantId: tenant.id,
          deletedAt: null,
        },
        data: {
          categoryId: targetCategory.id,
        },
      });

      return NextResponse.json({
        success: true,
        movedCount: result.count,
        fromCategory: category.name,
        toCategory: targetCategory.name,
      });
    }

    /* ===================================================== */
    /* UPDATE CATEGORY                                       */
    /* ===================================================== */

    const name = typeof body.name === "string" ? body.name.trim() : undefined;

    const image =
      body.image === null || typeof body.image === "string"
        ? body.image
        : undefined;

    const isFeatured =
      typeof body.isFeatured === "boolean" ? body.isFeatured : undefined;

    if (name === undefined && image === undefined && isFeatured === undefined) {
      return NextResponse.json(
        {
          error: "No category changes supplied",
        },
        { status: 400 },
      );
    }

    if (name !== undefined && !name) {
      return NextResponse.json(
        {
          error: "Category name cannot be empty",
        },
        { status: 400 },
      );
    }

    /*
     * Keep the existing slug unless the category name changes.
     *
     * If the name changes, generate a new slug while making
     * sure it does not collide with another category belonging
     * to the same tenant.
     */

    let slug = category.slug;

    if (name !== undefined && name !== category.name) {
      const baseSlug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");

      slug = baseSlug || category.slug;

      let candidateSlug = slug;
      let counter = 1;

      while (true) {
        const existingCategory = await prisma.category.findFirst({
          where: {
            tenantId: tenant.id,
            slug: candidateSlug,
            NOT: {
              id: category.id,
            },
          },
          select: {
            id: true,
          },
        });

        if (!existingCategory) {
          break;
        }

        counter += 1;
        candidateSlug = `${slug}-${counter}`;
      }

      slug = candidateSlug;
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id: category.id,
      },
      data: {
        ...(name !== undefined && {
          name,
        }),

        ...(name !== undefined && {
          slug,
        }),

        ...(image !== undefined && {
          image,
        }),

        ...(isFeatured !== undefined && {
          isFeatured,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      category: updatedCategory,
    });
  } catch (error) {
    console.error("UPDATE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to update category",
      },
      { status: 500 },
    );
  }
}

/* ========================================================= */
/* DELETE CATEGORY                                          */
/* ========================================================= */

export async function DELETE(req: Request, { params }: Params) {
  try {
    const { id } = await params;

    const tenant = await getDefaultTenant();

    if (!tenant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.category.findFirst({
      where: {
        id,
        tenantId: tenant.id,
      },
    });

    if (!category) {
      return NextResponse.json(
        {
          error: "Category not found",
        },
        { status: 404 },
      );
    }

    /*
     * We deliberately check first instead of relying on
     * PostgreSQL's RESTRICT error.
     */

    // Check active products
    const productCount = await prisma.product.count({
      where: {
        categoryId: category.id,
        tenantId: tenant.id,
        deletedAt: null,
      },
    });

    // Active products still exist
    if (productCount > 0) {
      return NextResponse.json(
        {
          error: "Category contains products",
          message: `This category still has ${productCount} ${
            productCount === 1 ? "product" : "products"
          } assigned to it. Move all products to another category before deleting.`,
          productCount,
        },
        { status: 409 },
      );
    }

    // Detach soft-deleted products
    await prisma.product.updateMany({
      where: {
        categoryId: category.id,
        tenantId: tenant.id,
        deletedAt: {
          not: null,
        },
      },
      data: {
        categoryId: null,
      },
    });

    // Delete category
    await prisma.category.delete({
      where: {
        id: category.id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE CATEGORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to delete category",
      },
      { status: 500 },
    );
  }
}
