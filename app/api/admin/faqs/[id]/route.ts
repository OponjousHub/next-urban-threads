import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } },
) {
  const tenant = await getDefaultTenant();

  await prisma.fAQ.delete({
    where: { id: params.id, tenantId: tenant!.id },
  });

  return Response.json({ success: true });
}
