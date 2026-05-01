import { NextResponse } from "next/server";
import ProductService from "./product.service";
import { CreateProductSchema, UpdateProductSchema } from "./product.schema";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";
import { getLoggedInUserId } from "@/lib/auth";
import { prisma } from "@/utils/prisma";

export default class ProductController {
  static async create(req: Request) {
    const userId = await getLoggedInUserId();
    const tenant = await getDefaultTenant();

    if (!userId) {
      return NextResponse.json(
        { message: "Unauthorized: invalid token" },
        { status: 401 },
      );
    }
    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    const user = await prisma.user.findUnique({
      where: { id: userId, tenantId: tenant.id },
      select: { id: true, name: true },
    });

    const body = await req.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
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
      sizes,
      colours,
      stock,
      featured,
      flash,
    } = parsed.data;
    console.log("CATEGORY IIII", category);

    const categoryExists = await prisma.category.findUnique({
      where: { id: category },
    });

    if (!categoryExists) {
      return NextResponse.json(
        { message: "Category not found" },
        { status: 400 },
      );
    }

    const product = await ProductService.createProduct(
      {
        name,
        // categoryId: category,
        category: { connect: { id: category } },
        subCategory,
        price,
        stock,
        instock: stock > 0,
        featured,
        isFlashDeal: flash,
        images,
        description,
        sizes,
        colours,
        user: user?.id ? { connect: { id: user.id } } : undefined,
        createdByName: user?.name,
      },
      tenant.id,
    );

    return NextResponse.json(product, { status: 201 });
  }

  static async getAll(req: Request) {
    const tenant = await getDefaultTenant();
    const { searchParams } = new URL(req.url);

    const category = searchParams.get("category") ?? undefined;
    const featured = searchParams.get("featured") === "true";
    const flash = searchParams.get("flash") === "true";
    const search = searchParams.get("search");

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

    let filters: any = {
      tenantId: tenant.id,
    };

    if (featured) {
      filters.featured = true; // <-- only fetch featured products
    }

    if (flash) {
      filters.isFlashDeal = true;
    }

    // ✅ Category filter
    if (category) {
      filters.category = {
        slug: category.toLowerCase(),
      };
    }

    //Search filter
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

    const products = await ProductService.getProducts(filters);

    return NextResponse.json(
      { result: products.length, products },
      { status: 200 },
    );
  }

  static async getOne(id: string) {
    const product = await ProductService.getProduct(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 },
      );
    }
    return NextResponse.json(product);
  }

  static async update(req: Request, id: string) {
    const body = await req.json();

    const parsed = UpdateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const product = await ProductService.updateProduct(id, parsed.data);
    return NextResponse.json(product);
  }

  static async deleteProduct(id: string) {
    await ProductService.deleteProduct(id);
    return NextResponse.json({ message: "Deleted successfully" });
  }
}
