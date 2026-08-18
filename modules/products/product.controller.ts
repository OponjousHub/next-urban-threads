import { NextResponse } from "next/server";
import ProductService from "./product.service";
import { CreateProductSchema, UpdateProductSchema } from "./product.schema";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLoggedInUserId } from "@/lib/auth";
import { prisma } from "@/utils/prisma";

export default class ProductController {
  /* =========================================================
     CREATE PRODUCT
     ========================================================= */

  static async create(req: Request) {
    try {
      const userId = await getLoggedInUserId();

      const tenant = await getDefaultTenant();

      if (!userId) {
        return NextResponse.json(
          {
            message: "Unauthorized: invalid token",
          },
          { status: 401 },
        );
      }

      if (!tenant) {
        return NextResponse.json(
          {
            message: "Default tenant not found",
          },
          { status: 404 },
        );
      }

      /*
       * -------------------------------------------------------
       * USER
       * -------------------------------------------------------
       */

      const user = await prisma.user.findUnique({
        where: {
          id: userId,
          tenantId: tenant.id,
        },
        select: {
          id: true,
          name: true,
        },
      });

      /*
       * -------------------------------------------------------
       * BODY VALIDATION
       * -------------------------------------------------------
       */

      const body = await req.json();

      const parsed = CreateProductSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            errors: parsed.error.flatten(),
          },
          { status: 400 },
        );
      }

      const {
        name,
        category,
        subCategory,
        price,
        images,
        description,
        variants,
        stock,
        featured,
        flash,
        videos,
        hasVariants,
      } = parsed.data;

      /*
       * -------------------------------------------------------
       * DETERMINE PRODUCT TYPE
       * -------------------------------------------------------
       */

      const isVariantProduct =
        hasVariants === true ||
        (hasVariants === undefined &&
          Array.isArray(variants) &&
          variants.length > 0);

      /*
       * A variant product must actually have variants.
       */
      if (isVariantProduct && (!variants || variants.length === 0)) {
        return NextResponse.json(
          {
            message:
              "A product with variants must contain at least one variant.",
          },
          { status: 400 },
        );
      }

      /*
       * A simple product does not need variants.
       */
      const finalStock = isVariantProduct
        ? (variants ?? []).reduce(
            (sum, variant) => sum + Number(variant.stock || 0),
            0,
          )
        : Number(stock || 0);

      /*
       * -------------------------------------------------------
       * CATEGORY
       * -------------------------------------------------------
       */

      const categoryExists = await prisma.category.findFirst({
        where: {
          id: category,
          tenantId: tenant.id,
        },
      });

      if (!categoryExists) {
        return NextResponse.json(
          {
            message: "Category not found",
          },
          { status: 400 },
        );
      }

      /*
       * -------------------------------------------------------
       * CREATE PRODUCT
       * -------------------------------------------------------
       */

      const product = await ProductService.createProduct(
        {
          name,

          category: {
            connect: {
              id: category,
            },
          },

          subCategory,

          price,

          /*
           * Simple product:
           *   supplied stock
           *
           * Variant product:
           *   total variant stock
           */
          stock: finalStock,

          instock: finalStock > 0,

          featured,

          isFlashDeal: flash,

          images,

          videos,

          description,

          user: user?.id
            ? {
                connect: {
                  id: user.id,
                },
              }
            : undefined,

          createdByName: user?.name,
        },
        tenant.id,
        tenant.storeMode,
      );

      /*
       * -------------------------------------------------------
       * CREATE VARIANTS
       * -------------------------------------------------------
       *
       * IMPORTANT:
       *
       * This now happens ONCE.
       *
       * Simple product:
       *   no variant records.
       *
       * Variant product:
       *   create variant records.
       */
      if (isVariantProduct && variants && variants.length > 0) {
        await prisma.productVariant.createMany({
          data: variants.map((variant) => ({
            productId: product.id,

            color: variant.color,

            size: variant.size,

            colorHex: variant.colorHex || "#000000",

            stock: Number(variant.stock || 0),

            price: Number(variant.price || price),

            image: variant.image || product.images?.[0] || "",
          })),
        });
      }

      /*
       * -------------------------------------------------------
       * RETURN COMPLETE PRODUCT
       * -------------------------------------------------------
       */

      const result = await prisma.product.findFirst({
        where: {
          id: product.id,
          tenantId: tenant.id,
        },
        include: {
          category: true,
          variants: true,
        },
      });

      return NextResponse.json(result ?? product, { status: 201 });
    } catch (error) {
      console.error("Create product error:", error);

      return NextResponse.json(
        {
          message: "Failed to create product",
        },
        { status: 500 },
      );
    }
  }

  /* =========================================================
     GET ALL PRODUCTS
     ========================================================= */

  static async getAll(req: Request) {
    const tenant = await getDefaultTenant();

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") ?? undefined;

    const featured = searchParams.get("featured") === "true";

    const flash = searchParams.get("flash") === "true";

    const search = searchParams.get("search");

    const page = Math.max(1, Number(searchParams.get("page") || 1));

    const limit = Math.max(1, Number(searchParams.get("limit") || 8));

    const skip = (page - 1) * limit;

    const filters: any = {
      tenantId: tenant.id,
      deletedAt: null,
      storeMode: tenant.storeMode,
    };

    /*
     * Featured
     */
    if (featured) {
      filters.featured = true;
    }

    /*
     * Flash deal
     */
    if (flash) {
      filters.isFlashDeal = true;
    }

    /*
     * Category
     */
    if (category) {
      filters.category = {
        slug: category.toLowerCase(),
      };
    }

    /*
     * Search
     */
    if (search) {
      filters.OR = [
        {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const [products, total] = await Promise.all([
      ProductService.getProducts({
        where: filters,
        skip,
        take: limit,
      }),

      ProductService.countProducts(filters),
    ]);

    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        result: products.length,
        products,
        total,
        page,
        totalPages,
      },
      { status: 200 },
    );
  }

  /* =========================================================
     GET ONE PRODUCT
     ========================================================= */

  static async getOne(id: string) {
    const product = await ProductService.getProduct(id);

    if (!product) {
      return NextResponse.json(
        {
          message: "Product not found",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(product);
  }

  /* =========================================================
     UPDATE PRODUCT
     ========================================================= */

  static async update(req: Request, id: string) {
    try {
      const body = await req.json();

      const parsed = UpdateProductSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          {
            errors: parsed.error.flatten(),
          },
          { status: 400 },
        );
      }

      const product = await ProductService.updateProduct(id, parsed.data);

      return NextResponse.json(product);
    } catch (error) {
      console.error("Update product error:", error);

      return NextResponse.json(
        {
          message: "Failed to update product",
        },
        { status: 500 },
      );
    }
  }

  /* =========================================================
     DELETE PRODUCT
     ========================================================= */

  static async deleteProduct(id: string) {
    await ProductService.deleteProduct(id);

    return NextResponse.json({
      message: "Deleted successfully",
    });
  }
}
