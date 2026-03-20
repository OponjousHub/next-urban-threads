import { prisma } from "@/utils/prisma";
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
