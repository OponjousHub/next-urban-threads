import ProductController from "@/modules/products/product.controller";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return ProductController.getOne(id);
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  return ProductController.update(req, params.id);
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  return ProductController.deleteProduct(params.id);
}
