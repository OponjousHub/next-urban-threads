// app/api/admin/search/route.ts

import { prisma } from "@/utils/prisma";
import { getDefaultTenant } from "@/app/lib/getDefaultTenant";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const tenant = await getDefaultTenant();
  if (!tenant) throw new Error("Tenant not found");

  if (!query) {
    return Response.json({
      orders: [],
      customers: [],
    });
  }

  const [orders, customers] = await Promise.all([
    prisma.order.findMany({
      where: {
        tenantId: tenant.id,
        OR: [
          { id: { contains: query, mode: "insensitive" } },
          {
            user: {
              name: { contains: query, mode: "insensitive" },
            },
          },
          {
            user: {
              email: { contains: query, mode: "insensitive" },
            },
          },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        totalAmount: true,
        createdAt: true,
        user: {
          select: { name: true, email: true },
        },
      },
    }),

    prisma.user.findMany({
      where: {
        tenantId: tenant.id,
        role: "USER",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
      },
    }),
  ]);

  return Response.json({
    orders,
    customers,
  });
}
