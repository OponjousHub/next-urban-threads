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
      subCategory, // ✅ REQUIRED
      price,
      images,
      description,
      sizes,
      colours,
      stock,
      featured,
    } = parsed.data;

    const product = await ProductService.createProduct(
      {
        name,
        category,
        subCategory,
        price,
        stock,
        instock: stock > 0,
        featured,
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

    if (!tenant) {
      throw new Error("Default tenant not found");
    }

  
    let categoryFilter = {};

    if (category) {
      categoryFilter = {
        category: {
          slug: category.toLowerCase(), // 🔥 match slug
        },
      };
    }

    const products = await ProductService.getProducts(
      // parsedCategory,
      categoryFilter,
    );

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
