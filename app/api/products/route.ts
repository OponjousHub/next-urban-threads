import ProductController from "@/modules/products/product.controller";

export async function POST(req: Request) {
  return ProductController.create(req);
}

export async function GET(req: Request) {
  return ProductController.getAll(req);
}
