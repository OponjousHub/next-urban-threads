import { NextResponse } from "next/server";
import ProductService from "./product.service";
import { CreateProductSchema, UpdateProductSchema } from "./product.schema";
import { Category } from "@prisma/client";
import { cookies } from "next/headers";
import AuthController from "@/modules/auth/auth.controller";
import { prisma } from "@/utils/prisma";

export default class ProductController {
  static async create(req: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    // if (!token) {
    //   throw new Error("Unauthorized: token missing");
    // }

    if (!token) {
      return NextResponse.json(
        {
          message: "Unauthorized: token missing",
        },
        { status: 401 }
      );
    }

    const result = AuthController.verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: result.id },
      select: { id: true, name: true },
    });

    const body = await req.json();
    const parsed = CreateProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten() },
        { status: 400 }
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

    const product = await ProductService.createProduct({
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
      createdBy: user?.id,
      createdByName: user?.name,
    });

    // const product = await ProductService.createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  }

  static async getAll(req: Request) {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") ?? undefined;

    let parsedCategory: Category | undefined = undefined;

    if (category && Object.values(Category).includes(category as Category)) {
      parsedCategory = category as Category;
    }

    const products = await ProductService.getProducts(parsedCategory);
    return NextResponse.json(
      { result: products.length, products },
      { status: 200 }
    );
  }

  static async getOne(id: string) {
    const product = await ProductService.getProduct(id);
    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
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
        { status: 400 }
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
